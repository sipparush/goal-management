import { randomUUID } from "crypto";
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

export async function GET(request) {
    try {
        const auth = await requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        if (!hasEffectivePermission(auth.user, PERMISSIONS.projectsView)) {
            return fail("forbidden", 403);
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search")?.trim() || "";
        const goalId = searchParams.get("goalId") || "all";
        const status = searchParams.get("status") || "all";

        const clauses = [];
        const params = [];

        if (!isAdmin(auth.user)) {
            params.push(auth.user.id);
            clauses.push(`(p.owner_user_id = $${params.length} OR p.assign_to_user_id = $${params.length})`);
        }

        if (search) {
            params.push(`%${search}%`);
            clauses.push(`(p.name ILIKE $${params.length} OR p.target ILIKE $${params.length} OR p.response_person ILIKE $${params.length})`);
        }

        if (goalId !== "all") {
            params.push(goalId);
            clauses.push(`p.goal_id = $${params.length}`);
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

        if (!hasEffectivePermission(auth.user, PERMISSIONS.projectsAdd)) {
            return fail("forbidden", 403);
        }

        const body = await request.json();
        const requiredFields = ["goalId", "name", "target", "assignToUserId", "startDate", "endDate"];

        for (const field of requiredFields) {
            if (!body[field]) {
                return fail(`${field} is required`, 400);
            }
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
            `INSERT INTO projects (id, goal_id, name, target, response_person, start_date, end_date, owner_user_id, assign_to_user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
            [
                randomUUID(),
                body.goalId,
                body.name.trim(),
                body.target.trim(),
                assignee.username,
                body.startDate,
                body.endDate,
                auth.user.id,
                assignee.id,
            ],
        );

        return ok({ item: mapProjectRow(result.rows[0]) }, 201);
    } catch (error) {
        return fail(`Failed to create project: ${error.message}`, 500);
    }
}
