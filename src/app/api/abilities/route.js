import { randomUUID } from "crypto";
import { dbQuery } from "@/lib/db";
import { ok, fail } from "@/lib/api-response";
import { hasEffectivePermission, isAdmin, requireAuth } from "@/lib/auth-server";
import { PERMISSIONS } from "@/lib/roles";
import { mapAbilityRow } from "@/lib/server-records";

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

        if (!hasEffectivePermission(auth.user, PERMISSIONS.abilitiesView)) {
            return fail("forbidden", 403);
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search")?.trim() || "";
        const projectId = searchParams.get("projectId") || "all";
        const status = searchParams.get("status") || "all";

        const clauses = [];
        const params = [];

        if (!isAdmin(auth.user)) {
            params.push(auth.user.id);
            clauses.push(`(a.owner_user_id = $${params.length} OR a.assign_to_user_id = $${params.length})`);
        }

        if (search) {
            params.push(`%${search}%`);
            clauses.push(`(a.name ILIKE $${params.length} OR a.target ILIKE $${params.length} OR a.response_person ILIKE $${params.length})`);
        }

        if (projectId !== "all") {
            if (projectId === "no-project") {
                clauses.push("a.project_id IS NULL");
            } else {
                params.push(projectId);
                clauses.push(`a.project_id = $${params.length}`);
            }
        }

        if (status === "in-time") {
            clauses.push("CURRENT_DATE <= a.end_date");
        }

        if (status === "delay") {
            clauses.push("CURRENT_DATE > a.end_date");
        }

        const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";

        const result = await dbQuery(
            `SELECT a.*, p.name AS project_name
       FROM abilities a
       LEFT JOIN projects p ON p.id = a.project_id
       ${where}
       ORDER BY a.start_date ASC, a.created_at DESC`,
            params,
        );

        return ok({ items: result.rows.map(mapAbilityRow) });
    } catch (error) {
        return fail(`Failed to fetch abilities: ${error.message}`, 500);
    }
}

export async function POST(request) {
    try {
        const auth = await requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        if (!hasEffectivePermission(auth.user, PERMISSIONS.abilitiesAdd)) {
            return fail("forbidden", 403);
        }

        const body = await request.json();
        const requiredFields = ["name", "target", "assignToUserId", "startDate", "endDate"];

        for (const field of requiredFields) {
            if (!body[field]) {
                return fail(`${field} is required`, 400);
            }
        }

        const normalizedProjectId = body.projectId || null;

        if (normalizedProjectId) {
            const ownProjectCheck = isAdmin(auth.user)
                ? await dbQuery("SELECT id FROM projects WHERE id = $1", [normalizedProjectId])
                : await dbQuery("SELECT id FROM projects WHERE id = $1 AND (owner_user_id = $2 OR assign_to_user_id = $2)", [normalizedProjectId, auth.user.id]);

            if (ownProjectCheck.rowCount === 0) {
                return fail("can only create ability under own project", 403);
            }
        }

        const assignee = await resolveAssignee(body.assignToUserId);
        if (!assignee) {
            return fail("assignToUserId not found or inactive", 400);
        }

        const result = await dbQuery(
            `INSERT INTO abilities (id, project_id, name, target, response_person, start_date, end_date, owner_user_id, assign_to_user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
            [
                randomUUID(),
                normalizedProjectId,
                body.name.trim(),
                body.target.trim(),
                assignee.username,
                body.startDate,
                body.endDate,
                auth.user.id,
                assignee.id,
            ],
        );

        return ok({ item: mapAbilityRow(result.rows[0]) }, 201);
    } catch (error) {
        return fail(`Failed to create ability: ${error.message}`, 500);
    }
}
