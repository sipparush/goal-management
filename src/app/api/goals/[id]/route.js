import { dbQuery } from "@/lib/db";
import { ok, fail } from "@/lib/api-response";
import { isAdmin, isManager, requireAuth } from "@/lib/auth-server";
import { mapGoalRow } from "@/lib/server-records";

export async function PUT(request, { params }) {
    try {
        const auth = await requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        if (!isAdmin(auth.user) && !isManager(auth.user)) {
            return fail("forbidden", 403);
        }

        const { id } = await params;
        const body = await request.json();

        const name = body.name?.trim();
        const target = body.target?.trim();

        if (!name || !target) {
            return fail("name and target are required", 400);
        }

        const result = await dbQuery(
            `UPDATE goals
       SET name = $1,
           target = $2,
           current_target = $3,
           expect = $4,
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
            [name, target, body.currentTarget?.trim() || null, body.expect?.trim() || null, id],
        );

        if (result.rowCount === 0) {
            return fail("goal not found", 404);
        }

        return ok({ item: mapGoalRow(result.rows[0]) });
    } catch (error) {
        return fail(`Failed to update goal: ${error.message}`, 500);
    }
}

export async function DELETE(_request, { params }) {
    try {
        const auth = await requireAuth(_request);
        if (auth.error) {
            return auth.error;
        }

        if (!isAdmin(auth.user) && !isManager(auth.user)) {
            return fail("forbidden", 403);
        }

        const { id } = await params;
        const result = await dbQuery("DELETE FROM goals WHERE id = $1", [id]);

        if (result.rowCount === 0) {
            return fail("goal not found", 404);
        }

        return ok({ success: true });
    } catch (error) {
        return fail(`Failed to delete goal: ${error.message}`, 500);
    }
}
