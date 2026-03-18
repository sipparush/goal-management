import { randomUUID } from "crypto";
import { dbQuery } from "@/lib/db";
import { ok, fail } from "@/lib/api-response";
import { isAdmin, isStaff, requireAuth } from "@/lib/auth-server";
import { mapTicketRow } from "@/lib/server-records";

export async function GET(request) {
    try {
        const auth = await requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search")?.trim() || "";
        const abilityId = searchParams.get("abilityId") || "all";
        const status = searchParams.get("status") || "all";

        const clauses = [];
        const params = [];

        if (search) {
            params.push(`%${search}%`);
            clauses.push(`(t.title ILIKE $${params.length} OR t.target ILIKE $${params.length} OR t.response_person ILIKE $${params.length})`);
        }

        if (abilityId !== "all") {
            params.push(abilityId);
            clauses.push(`t.ability_id = $${params.length}`);
        }

        if (isStaff(auth.user)) {
            params.push(auth.user.id);
            clauses.push(`t.owner_user_id = $${params.length}`);
        }

        if (status === "in-time") {
            clauses.push("CURRENT_DATE <= t.end_date");
        }

        if (status === "delay") {
            clauses.push("CURRENT_DATE > t.end_date");
        }

        const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";

        const result = await dbQuery(
            `SELECT t.*, a.name AS ability_name
       FROM tickets t
       JOIN abilities a ON a.id = t.ability_id
       ${where}
       ORDER BY t.start_date ASC, t.created_at DESC`,
            params,
        );

        return ok({ items: result.rows.map(mapTicketRow) });
    } catch (error) {
        return fail(`Failed to fetch tickets: ${error.message}`, 500);
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
        const requiredFields = ["abilityId", "title", "target", "responsePerson", "startDate", "endDate"];

        for (const field of requiredFields) {
            if (!body[field]) {
                return fail(`${field} is required`, 400);
            }
        }

        if (isStaff(auth.user)) {
            const ownAbilityCheck = await dbQuery("SELECT id FROM abilities WHERE id = $1 AND owner_user_id = $2", [
                body.abilityId,
                auth.user.id,
            ]);

            if (ownAbilityCheck.rowCount === 0) {
                return fail("staff can create ticket only under own ability", 403);
            }
        }

        const result = await dbQuery(
            `INSERT INTO tickets (id, ability_id, title, target, response_person, start_date, end_date, owner_user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
            [
                randomUUID(),
                body.abilityId,
                body.title.trim(),
                body.target.trim(),
                body.responsePerson.trim(),
                body.startDate,
                body.endDate,
                auth.user.id,
            ],
        );

        return ok({ item: mapTicketRow(result.rows[0]) }, 201);
    } catch (error) {
        return fail(`Failed to create ticket: ${error.message}`, 500);
    }
}
