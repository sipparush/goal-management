import { dbQuery } from "@/lib/db";
import { ok, fail } from "@/lib/api-response";
import { isAdmin, isStaff, requireAuth } from "@/lib/auth-server";

function mapActionPlanRow(row) {
    return {
        id: row.id,
        ticketId: row.ticket_id,
        action: row.action_text,
        status: row.status,
        duration: row.duration_minutes,
        start: row.exp_start,
        end: row.exp_end,
        remark: row.remark || "",
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

async function canAccessRow(rowId, user) {
    const result = isStaff(user)
        ? await dbQuery(
              `SELECT apr.id
               FROM action_plan_rows apr
               JOIN tickets t ON t.id = apr.ticket_id
               WHERE apr.id = $1 AND t.owner_user_id = $2`,
              [rowId, user.id],
          )
        : await dbQuery("SELECT id FROM action_plan_rows WHERE id = $1", [rowId]);

    return result.rowCount > 0;
}

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
        const action = body.action?.trim();
        const status = body.status?.trim();
        const duration = Number(body.duration || 0);

        if (!action || !status) {
            return fail("action and status are required", 400);
        }

        if (!Number.isFinite(duration) || duration < 0) {
            return fail("duration must be a non-negative number", 400);
        }

        const accessAllowed = await canAccessRow(id, auth.user);
        if (!accessAllowed) {
            return fail("action plan row not found", 404);
        }

        const result = await dbQuery(
            `UPDATE action_plan_rows
             SET action_text = $1,
                 status = $2,
                 duration_minutes = $3,
                 exp_start = $4,
                 exp_end = $5,
                 remark = $6,
                 updated_at = NOW()
             WHERE id = $7
             RETURNING *`,
            [
                action,
                status,
                Math.floor(duration),
                body.start || null,
                body.end || null,
                body.remark?.trim() || null,
                id,
            ],
        );

        return ok({ item: mapActionPlanRow(result.rows[0]) });
    } catch (error) {
        return fail(`Failed to update action plan row: ${error.message}`, 500);
    }
}

export async function DELETE(request, { params }) {
    try {
        const auth = await requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        if (!isAdmin(auth.user) && !isStaff(auth.user)) {
            return fail("forbidden", 403);
        }

        const { id } = await params;
        const accessAllowed = await canAccessRow(id, auth.user);
        if (!accessAllowed) {
            return fail("action plan row not found", 404);
        }

        await dbQuery("DELETE FROM action_plan_rows WHERE id = $1", [id]);
        return ok({ success: true });
    } catch (error) {
        return fail(`Failed to delete action plan row: ${error.message}`, 500);
    }
}
