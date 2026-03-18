import { randomUUID } from "crypto";
import { dbQuery } from "@/lib/db";
import { ok, fail } from "@/lib/api-response";
import { isAdmin, isStaff, requireAuth } from "@/lib/auth-server";
import { mapProjectRow } from "@/lib/server-records";

export async function GET(request) {
    try {
        const auth = await requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search")?.trim() || "";
        const goalId = searchParams.get("goalId") || "all";
        const status = searchParams.get("status") || "all";

        const clauses = [];
        const params = [];

        if (search) {
            params.push(`%${search}%`);
            clauses.push(`(p.name ILIKE $${params.length} OR p.target ILIKE $${params.length} OR p.response_person ILIKE $${params.length})`);
        }

        if (goalId !== "all") {
            params.push(goalId);
            clauses.push(`p.goal_id = $${params.length}`);
        }

        if (isStaff(auth.user)) {
            params.push(auth.user.id);
            clauses.push(`p.owner_user_id = $${params.length}`);
        }

        if (status === "in-time") {
            clauses.push("CURRENT_DATE <= p.end_date");
        }

        if (status === "delay") {
            clauses.push("CURRENT_DATE > p.end_date");
        }

        const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";

        const result = await dbQuery(
            `SELECT p.*, g.name AS goal_name
       FROM projects p
       JOIN goals g ON g.id = p.goal_id
       ${where}
       ORDER BY p.start_date ASC, p.created_at DESC`,
            params,
        );

        return ok({ items: result.rows.map(mapProjectRow) });
    } catch (error) {
        return fail(`Failed to fetch projects: ${error.message}`, 500);
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
        const requiredFields = ["goalId", "name", "target", "responsePerson", "startDate", "endDate"];

        for (const field of requiredFields) {
            if (!body[field]) {
                return fail(`${field} is required`, 400);
            }
        }

        const result = await dbQuery(
            `INSERT INTO projects (id, goal_id, name, target, response_person, start_date, end_date, owner_user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
            [
                randomUUID(),
                body.goalId,
                body.name.trim(),
                body.target.trim(),
                body.responsePerson.trim(),
                body.startDate,
                body.endDate,
                auth.user.id,
            ],
        );

        return ok({ item: mapProjectRow(result.rows[0]) }, 201);
    } catch (error) {
        return fail(`Failed to create project: ${error.message}`, 500);
    }
}
