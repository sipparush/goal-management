import { randomUUID } from "crypto";
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

async function canAccessTicket(ticketId, user) {
    const ticketResult = isAdmin(user)
        ? await dbQuery("SELECT id FROM tickets WHERE id = $1", [ticketId])
        : await dbQuery("SELECT id FROM tickets WHERE id = $1 AND (owner_user_id = $2 OR assign_to_user_id = $2)", [ticketId, user.id]);
    return ticketResult.rowCount > 0;
}

export async function GET(request) {
    try {
        const auth = await requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        if (!hasEffectivePermission(auth.user, PERMISSIONS.actionPlansView)) {
            return fail("forbidden", 403);
        }

        const { searchParams } = new URL(request.url);
        const ticketId = searchParams.get("ticketId") || "";

        if (!ticketId) {
            return fail("ticketId is required", 400);
        }

        const owns = await canAccessTicket(ticketId, auth.user);
        if (!owns) {
            return fail("forbidden", 403);
        }

        const result = await dbQuery(
            `SELECT *
             FROM action_plan_rows
             WHERE ticket_id = $1
             ORDER BY sort_order ASC, created_at ASC`,
            [ticketId],
        );

        return ok({ items: result.rows.map(mapActionPlanRow) });
    } catch (error) {
        return fail(`Failed to fetch action plan rows: ${error.message}`, 500);
    }
}

export async function POST(request) {
    try {
        const auth = await requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        if (!hasEffectivePermission(auth.user, PERMISSIONS.actionPlansAdd)) {
            return fail("forbidden", 403);
        }

        const body = await request.json();
        const ticketId = body.ticketId;
        const phase = body.phase?.trim() || null;
        const itemNoRaw = String(body.itemNo || "").trim();
        const itemNo = itemNoRaw ? Number(itemNoRaw) : null;
        const action = body.action?.trim();
        const status = body.status?.trim();
        const duration = Number(body.duration || 0);

        if (!ticketId || !action || !status) {
            return fail("ticketId, action and status are required", 400);
        }

        if ((itemNoRaw && !Number.isInteger(itemNo)) || !Number.isFinite(duration) || duration < 0) {
            return fail("itemNo and duration must be valid non-negative numbers", 400);
        }

        const owns = await canAccessTicket(ticketId, auth.user);
        if (!owns) {
            return fail("forbidden", 403);
        }

        const maxOrderResult = await dbQuery("SELECT COALESCE(MAX(sort_order), 0) AS max_order FROM action_plan_rows WHERE ticket_id = $1", [
            ticketId,
        ]);

        const result = await dbQuery(
            `INSERT INTO action_plan_rows
             (id, ticket_id, phase, item_no, action_text, status, duration_minutes, sort_order, exp_start, exp_end, remark)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             RETURNING *`,
            [
                randomUUID(),
                ticketId,
                phase,
                itemNo,
                action,
                status,
                Math.floor(duration),
                Number(maxOrderResult.rows[0].max_order || 0) + 1,
                body.start || null,
                body.end || null,
                body.remark?.trim() || null,
            ],
        );

        return ok({ item: mapActionPlanRow(result.rows[0]) }, 201);
    } catch (error) {
        return fail(`Failed to create action plan row: ${error.message}`, 500);
    }
}

export async function DELETE(request) {
    try {
        const auth = await requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        if (!hasEffectivePermission(auth.user, PERMISSIONS.actionPlansDelete)) {
            return fail("forbidden", 403);
        }

        const { searchParams } = new URL(request.url);
        const ticketId = searchParams.get("ticketId") || "";

        if (!ticketId) {
            return fail("ticketId is required", 400);
        }

        const owns = await canAccessTicket(ticketId, auth.user);
        if (!owns) {
            return fail("forbidden", 403);
        }

        const deleteResult = await dbQuery("DELETE FROM action_plan_rows WHERE ticket_id = $1", [ticketId]);

        return ok({ clearedCount: deleteResult.rowCount || 0 });
    } catch (error) {
        return fail(`Failed to clear action plan rows: ${error.message}`, 500);
    }
}
