import { dbQuery } from "@/lib/db";
import { ok, fail } from "@/lib/api-response";
import { hasEffectivePermission, isAdmin, requireAuth } from "@/lib/auth-server";
import { PERMISSIONS } from "@/lib/roles";
import { mapProjectRow } from "@/lib/server-records";

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

        if (!hasEffectivePermission(auth.user, PERMISSIONS.projectsEdit)) {
            return fail("forbidden", 403);
        }

        const { id } = await params;
        const body = await request.json();
        const requiredFields = ["goalId", "name", "target", "assignToUserId", "startDate", "endDate"];

        for (const field of requiredFields) {
            if (!body[field]) {
                return fail(`${field} is required`, 400);
            }
        }

        const projectCheck = isAdmin(auth.user)
            ? await dbQuery("SELECT id FROM projects WHERE id = $1", [id])
            : await dbQuery("SELECT id FROM projects WHERE id = $1 AND (owner_user_id = $2 OR assign_to_user_id = $2)", [id, auth.user.id]);
        if (projectCheck.rowCount === 0) {
            return fail("project not found", 404);
        }

        const goalCheck = isAdmin(auth.user)
            ? await dbQuery("SELECT id FROM goals WHERE id = $1", [body.goalId])
            : await dbQuery("SELECT id FROM goals WHERE id = $1 AND owner_user_id = $2", [body.goalId, auth.user.id]);
        if (goalCheck.rowCount === 0) {
            return fail("goal not found or not owned by user", 400);
        }

        const assignee = await resolveAssignee(body.assignToUserId);
        if (!assignee) {
            return fail("assignToUserId not found or inactive", 400);
        }

        const result = await dbQuery(
            `UPDATE projects
       SET goal_id = $1,
           name = $2,
           target = $3,
           response_person = $4,
           start_date = $5,
           end_date = $6,
           assign_to_user_id = $7,
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
            [body.goalId, body.name.trim(), body.target.trim(), assignee.username, body.startDate, body.endDate, assignee.id, id],
        );

        return ok({ item: mapProjectRow(result.rows[0]) });
    } catch (error) {
        return fail(`Failed to update project: ${error.message}`, 500);
    }
}

export async function DELETE(_request, { params }) {
    try {
        const auth = await requireAuth(_request);
        if (auth.error) {
            return auth.error;
        }

        if (!hasEffectivePermission(auth.user, PERMISSIONS.projectsDelete)) {
            return fail("forbidden", 403);
        }

        const { id } = await params;
        const projectResult = isAdmin(auth.user)
            ? await dbQuery("SELECT id FROM projects WHERE id = $1", [id])
            : await dbQuery("SELECT id FROM projects WHERE id = $1 AND (owner_user_id = $2 OR assign_to_user_id = $2)", [id, auth.user.id]);

        if (projectResult.rowCount === 0) {
            return fail("project not found", 404);
        }

        await dbQuery(
            `UPDATE ability_files
             SET ability_id = NULL,
                 project_id = NULL,
                 orphaned_at = COALESCE(orphaned_at, NOW())
             WHERE project_id = $1
               AND deleted_at IS NULL`,
            [id],
        );

        await dbQuery("DELETE FROM projects WHERE id = $1", [id]);


        return ok({ success: true });
    } catch (error) {
        return fail(`Failed to delete project: ${error.message}`, 500);
    }
}
