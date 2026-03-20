import { dbQuery } from "@/lib/db";
import { ok, fail } from "@/lib/api-response";
import { hasEffectivePermission, isAdmin, requireAuth } from "@/lib/auth-server";
import { PERMISSIONS } from "@/lib/roles";

async function canAccessTicket(ticketId, user) {
    const ticketResult = isAdmin(user)
        ? await dbQuery("SELECT id FROM tickets WHERE id = $1", [ticketId])
        : await dbQuery("SELECT id FROM tickets WHERE id = $1 AND (owner_user_id = $2 OR assign_to_user_id = $2)", [ticketId, user.id]);
    return ticketResult.rowCount > 0;
}

export async function PUT(request) {
    try {
        const auth = await requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        if (!hasEffectivePermission(auth.user, PERMISSIONS.actionPlansEdit)) {
            return fail("forbidden", 403);
        }

        const body = await request.json();
        const ticketId = String(body.ticketId || "").trim();
        const orderedIds = Array.isArray(body.orderedIds) ? body.orderedIds : [];

        if (!ticketId || orderedIds.length === 0) {
            return fail("ticketId and orderedIds are required", 400);
        }

        const owns = await canAccessTicket(ticketId, auth.user);
        if (!owns) {
            return fail("forbidden", 403);
        }

        const rowCheck = await dbQuery(
            `SELECT id
             FROM action_plan_rows
             WHERE ticket_id = $1
               AND id = ANY($2::uuid[])`,
            [ticketId, orderedIds],
        );

        if (rowCheck.rowCount !== orderedIds.length) {
            return fail("some rows are not found under the selected ticket", 400);
        }

        const cases = [];
        const params = [ticketId];

        orderedIds.forEach((id, index) => {
            params.push(id);
            const paramIndex = params.length;
            cases.push(`WHEN id = $${paramIndex} THEN ${index + 1}`);
        });

        await dbQuery(
            `UPDATE action_plan_rows
             SET sort_order = CASE
               ${cases.join("\n               ")}
               ELSE sort_order
             END,
             updated_at = NOW()
             WHERE ticket_id = $1`,
            params,
        );

        return ok({ success: true });
    } catch (error) {
        return fail(`Failed to reorder action plan rows: ${error.message}`, 500);
    }
}
