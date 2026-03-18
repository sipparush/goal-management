import { dbQuery } from "@/lib/db";
import { ok, fail } from "@/lib/api-response";
import { isAdmin, isStaff, requireAuth } from "@/lib/auth-server";
import { mapAbilityRow } from "@/lib/server-records";

export async function PUT(request, { params }) {
    try {
        const auth = await requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        if (!isAdmin(auth.user) && !isStaff(auth.user)) {
            return fail("forbidden", 403);
        }

        const { id } = await params;
        const body = await request.json();
        const requiredFields = ["projectId", "name", "target", "responsePerson", "startDate", "endDate"];

        for (const field of requiredFields) {
            if (!body[field]) {
                return fail(`${field} is required`, 400);
            }
        }

        if (isStaff(auth.user)) {
            const ownProjectCheck = await dbQuery("SELECT id FROM projects WHERE id = $1 AND owner_user_id = $2", [
                body.projectId,
                auth.user.id,
            ]);

            if (ownProjectCheck.rowCount === 0) {
                return fail("staff can update ability only under own project", 403);
            }
        }

        const whereClause = isStaff(auth.user)
            ? "WHERE id = $7 AND owner_user_id = $8"
            : "WHERE id = $7";

        const queryParams = [
            body.projectId,
            body.name.trim(),
            body.target.trim(),
            body.responsePerson.trim(),
            body.startDate,
            body.endDate,
            id,
        ];

        if (isStaff(auth.user)) {
            queryParams.push(auth.user.id);
        }

        const result = await dbQuery(
            `UPDATE abilities
       SET project_id = $1,
           name = $2,
           target = $3,
           response_person = $4,
           start_date = $5,
           end_date = $6,
           updated_at = NOW()
       ${whereClause}
       RETURNING *`,
            queryParams,
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

        if (!isAdmin(auth.user) && !isStaff(auth.user)) {
            return fail("forbidden", 403);
        }

        const { id } = await params;
        const result = isStaff(auth.user)
            ? await dbQuery("DELETE FROM abilities WHERE id = $1 AND owner_user_id = $2", [id, auth.user.id])
            : await dbQuery("DELETE FROM abilities WHERE id = $1", [id]);

        if (result.rowCount === 0) {
            return fail("ability not found", 404);
        }

        return ok({ success: true });
    } catch (error) {
        return fail(`Failed to delete ability: ${error.message}`, 500);
    }
}
