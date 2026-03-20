import { dbQuery } from "@/lib/db";
import { ok, fail } from "@/lib/api-response";
import { hasEffectivePermission, isAdmin, requireAuth } from "@/lib/auth-server";
import { PERMISSIONS } from "@/lib/roles";

function mapActionPlanRow(row) {
    return {
        id: row.id,
        ticketId: row.ticket_id,
        phase: row.phase || "",
        itemNo: row.item_no,
        action: row.action_text,
        status: row.status,
        duration: row.duration_minutes,
        sortOrder: row.sort_order,
        start: row.exp_start,
        end: row.exp_end,
        remark: row.remark || "",
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

async function canAccessRow(rowId, user) {
    const result = isAdmin(user)
        ? await dbQuery(
            `SELECT apr.id
               FROM action_plan_rows apr
               JOIN tickets t ON t.id = apr.ticket_id
               WHERE apr.id = $1`,
            [rowId],
        )
        : await dbQuery(
            `SELECT apr.id
               FROM action_plan_rows apr
               JOIN tickets t ON t.id = apr.ticket_id
               WHERE apr.id = $1 AND (t.owner_user_id = $2 OR t.assign_to_user_id = $2)`,
            [rowId, user.id],
        );

    return result.rowCount > 0;
}

export async function PUT(request, { params }) {
    try {
        const auth = await requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        if (!hasEffectivePermission(auth.user, PERMISSIONS.actionPlansEdit)) {
            return fail("forbidden", 403);
        }

        const { id } = await params;
        const body = await request.json();
        const phase = body.phase?.trim() || null;
        const itemNoRaw = String(body.itemNo || "").trim();
        const itemNo = itemNoRaw ? Number(itemNoRaw) : null;
        const action = body.action?.trim();
        const status = body.status?.trim();
        const duration = Number(body.duration || 0);

        if (!action || !status) {
            return fail("action and status are required", 400);
        }

        if ((itemNoRaw && !Number.isInteger(itemNo)) || !Number.isFinite(duration) || duration < 0) {
            return fail("itemNo and duration must be valid non-negative numbers", 400);
        }

        const accessAllowed = await canAccessRow(id, auth.user);
        if (!accessAllowed) {
            return fail("action plan row not found", 404);
        }

        const result = await dbQuery(
            `UPDATE action_plan_rows
             SET phase = $1,
                 item_no = $2,
                 action_text = $3,
                 status = $4,
                 duration_minutes = $5,
                 exp_start = $6,
                 exp_end = $7,
                 remark = $8,
                 updated_at = NOW()
             WHERE id = $9
             RETURNING *`,
            [
                phase,
                itemNo,
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

        if (!hasEffectivePermission(auth.user, PERMISSIONS.actionPlansDelete)) {
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
