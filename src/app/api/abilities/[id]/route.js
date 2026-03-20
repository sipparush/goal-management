import { dbQuery } from "@/lib/db";
import { ok, fail } from "@/lib/api-response";
import { hasEffectivePermission, isAdmin, requireAuth } from "@/lib/auth-server";
import { PERMISSIONS } from "@/lib/roles";
import { mapAbilityRow } from "@/lib/server-records";

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

        if (!hasEffectivePermission(auth.user, PERMISSIONS.abilitiesEdit)) {
            return fail("forbidden", 403);
        }

        const { id } = await params;
        const body = await request.json();
        const requiredFields = ["name", "target", "assignToUserId", "startDate", "endDate"];

        for (const field of requiredFields) {
            if (!body[field]) {
                return fail(`${field} is required`, 400);
            }
        }

        const normalizedProjectId = body.projectId || null;

        const abilityCheck = isAdmin(auth.user)
            ? await dbQuery("SELECT id FROM abilities WHERE id = $1", [id])
            : await dbQuery("SELECT id FROM abilities WHERE id = $1 AND (owner_user_id = $2 OR assign_to_user_id = $2)", [id, auth.user.id]);
        if (abilityCheck.rowCount === 0) {
            return fail("ability not found", 404);
        }

        if (normalizedProjectId) {
            const ownProjectCheck = isAdmin(auth.user)
                ? await dbQuery("SELECT id FROM projects WHERE id = $1", [normalizedProjectId])
                : await dbQuery("SELECT id FROM projects WHERE id = $1 AND (owner_user_id = $2 OR assign_to_user_id = $2)", [normalizedProjectId, auth.user.id]);

            if (ownProjectCheck.rowCount === 0) {
                return fail("can update ability only under own project", 403);
            }
        }

        const assignee = await resolveAssignee(body.assignToUserId);
        if (!assignee) {
            return fail("assignToUserId not found or inactive", 400);
        }

        const result = await dbQuery(
            `UPDATE abilities
       SET project_id = $1,
           name = $2,
           target = $3,
           response_person = $4,
           start_date = $5,
           end_date = $6,
           assign_to_user_id = $7,
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
            [
                normalizedProjectId,
                body.name.trim(),
                body.target.trim(),
                assignee.username,
                body.startDate,
                body.endDate,
                assignee.id,
                id,
            ],
        );

        if (result.rowCount === 0) {
            return fail("ability not found", 404);
        }

        return ok({ item: mapAbilityRow(result.rows[0]) });
    } catch (error) {
        return fail(`Failed to update ability: ${error.message}`, 500);
    }
}

export async function DELETE(_request, { params }) {
    try {
        const auth = await requireAuth(_request);
        if (auth.error) {
            return auth.error;
        }

        if (!hasEffectivePermission(auth.user, PERMISSIONS.abilitiesDelete)) {
            return fail("forbidden", 403);
        }

        const { id } = await params;
        const abilityResult = isAdmin(auth.user)
            ? await dbQuery("SELECT id FROM abilities WHERE id = $1", [id])
            : await dbQuery("SELECT id FROM abilities WHERE id = $1 AND (owner_user_id = $2 OR assign_to_user_id = $2)", [id, auth.user.id]);

        if (abilityResult.rowCount === 0) {
            return fail("ability not found", 404);
        }

        await dbQuery(
            `UPDATE ability_files
             SET ability_id = NULL,
                 project_id = NULL,
                 orphaned_at = COALESCE(orphaned_at, NOW())
             WHERE ability_id = $1
               AND deleted_at IS NULL`,
            [id],
        );

        await dbQuery("DELETE FROM abilities WHERE id = $1", [id]);

        return ok({ success: true });
    } catch (error) {
        return fail(`Failed to delete ability: ${error.message}`, 500);
    }
}
