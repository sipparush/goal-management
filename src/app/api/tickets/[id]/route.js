import { dbQuery } from "@/lib/db";
import { ok, fail } from "@/lib/api-response";
import { hasEffectivePermission, isAdmin, requireAuth } from "@/lib/auth-server";
import { PERMISSIONS } from "@/lib/roles";
import { mapTicketRow } from "@/lib/server-records";

async function resolveAssignee(assignToUserId) {
    const result = await dbQuery("SELECT id, username FROM users WHERE id = $1 AND is_active = TRUE", [assignToUserId]);
    if (result.rowCount === 0) {
        return null;
    }
    return result.rows[0];
}

export async function PUT(request, { params }) {
    try {
        const auth = await requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        if (!hasEffectivePermission(auth.user, PERMISSIONS.ticketsEdit)) {
            return fail("forbidden", 403);
        }

        const { id } = await params;
        const body = await request.json();
        const requiredFields = ["abilityId", "title", "target", "assignToUserId", "startDate", "endDate"];

        for (const field of requiredFields) {
            if (!body[field]) {
                return fail(`${field} is required`, 400);
            }
        }

        const ownAbilityCheck = isAdmin(auth.user)
            ? await dbQuery("SELECT id FROM abilities WHERE id = $1", [body.abilityId])
            : await dbQuery("SELECT id FROM abilities WHERE id = $1 AND (owner_user_id = $2 OR assign_to_user_id = $2)", [body.abilityId, auth.user.id]);

        if (ownAbilityCheck.rowCount === 0) {
            return fail("staff can update ticket only under own ability", 403);
        }

        const assignee = await resolveAssignee(body.assignToUserId);
        if (!assignee) {
            return fail("assignToUserId not found or inactive", 400);
        }

        const result = await dbQuery(
            `UPDATE tickets
       SET ability_id = $1,
           title = $2,
           target = $3,
           response_person = $4,
           start_date = $5,
           end_date = $6,
           assign_to_user_id = $7,
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
            [
                body.abilityId,
                body.title.trim(),
                body.target.trim(),
                assignee.username,
                body.startDate,
                body.endDate,
                assignee.id,
                id,
            ],
        );

        if (result.rowCount === 0) {
            return fail("ticket not found", 404);
        }

        return ok({ item: mapTicketRow(result.rows[0]) });
    } catch (error) {
        return fail(`Failed to update ticket: ${error.message}`, 500);
    }
}

export async function DELETE(_request, { params }) {
    try {
        const auth = await requireAuth(_request);
        if (auth.error) {
            return auth.error;
        }

        if (!hasEffectivePermission(auth.user, PERMISSIONS.ticketsDelete)) {
            return fail("forbidden", 403);
        }

        const { id } = await params;
        const result = isAdmin(auth.user)
            ? await dbQuery("DELETE FROM tickets WHERE id = $1", [id])
            : await dbQuery("DELETE FROM tickets WHERE id = $1 AND (owner_user_id = $2 OR assign_to_user_id = $2)", [id, auth.user.id]);

        if (result.rowCount === 0) {
            return fail("ticket not found", 404);
        }

        return ok({ success: true });
    } catch (error) {
        return fail(`Failed to delete ticket: ${error.message}`, 500);
    }
}

export async function PATCH(request, { params }) {
    try {
        const auth = await requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        if (!hasEffectivePermission(auth.user, PERMISSIONS.ticketsEdit)) {
            return fail("forbidden", 403);
        }

        const { id } = await params;
        const body = await request.json();

        if (body.action !== "close") {
            return fail("unsupported action", 400);
        }

        const result = await dbQuery(
            `UPDATE tickets
             SET closed_at = NOW(), updated_at = NOW()
             WHERE id = $1
               AND closed_at IS NULL
             RETURNING *`,
            [id],
        );

        if (result.rowCount === 0) {
            return fail("ticket not found or already closed", 404);
        }

        return ok({ item: mapTicketRow(result.rows[0]) });
    } catch (error) {
        return fail(`Failed to close ticket: ${error.message}`, 500);
    }
}
