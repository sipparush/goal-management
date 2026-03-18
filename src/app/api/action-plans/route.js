import { randomUUID } from "crypto";
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

async function staffOwnsTicket(ticketId, userId) {
    const ownTicket = await dbQuery("SELECT id FROM tickets WHERE id = $1 AND owner_user_id = $2", [ticketId, userId]);
    return ownTicket.rowCount > 0;
}

export async function GET(request) {
    try {
        const auth = await requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        if (!isAdmin(auth.user) && !isStaff(auth.user)) {
            return fail("forbidden", 403);
        }

        const { searchParams } = new URL(request.url);
        const ticketId = searchParams.get("ticketId") || "";

        if (!ticketId) {
            return fail("ticketId is required", 400);
        }

        if (isStaff(auth.user)) {
            const owns = await staffOwnsTicket(ticketId, auth.user.id);
            if (!owns) {
                return fail("forbidden", 403);
            }
        }

        const result = await dbQuery(
            `SELECT *
             FROM action_plan_rows
             WHERE ticket_id = $1
             ORDER BY created_at ASC`,
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

        if (!isAdmin(auth.user) && !isStaff(auth.user)) {
            return fail("forbidden", 403);
        }

        const body = await request.json();
        const ticketId = body.ticketId;
        const action = body.action?.trim();
        const status = body.status?.trim();
        const duration = Number(body.duration || 0);

        if (!ticketId || !action || !status) {
            return fail("ticketId, action and status are required", 400);
        }

        if (!Number.isFinite(duration) || duration < 0) {
            return fail("duration must be a non-negative number", 400);
        }

        if (isStaff(auth.user)) {
            const owns = await staffOwnsTicket(ticketId, auth.user.id);
            if (!owns) {
                return fail("forbidden", 403);
            }
        }

        const result = await dbQuery(
            `INSERT INTO action_plan_rows
             (id, ticket_id, action_text, status, duration_minutes, exp_start, exp_end, remark)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [
                randomUUID(),
                ticketId,
                action,
                status,
                Math.floor(duration),
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
