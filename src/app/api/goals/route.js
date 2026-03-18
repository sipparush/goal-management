import { randomUUID } from "crypto";
import { dbQuery } from "@/lib/db";
import { ok, fail } from "@/lib/api-response";
import { isAdmin, isManager, requireAuth } from "@/lib/auth-server";
import { mapGoalRow } from "@/lib/server-records";

export async function GET(request) {
    try {
        const auth = await requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search")?.trim() || "";
        const currentTarget = searchParams.get("currentTarget") || "all";

        const clauses = [];
        const params = [];

        if (search) {
            params.push(`%${search}%`);
            clauses.push(`(name ILIKE $${params.length} OR target ILIKE $${params.length} OR COALESCE(expect, '') ILIKE $${params.length})`);
        }

        if (currentTarget === "with") {
            clauses.push("COALESCE(current_target, '') <> ''");
        }

        if (currentTarget === "without") {
            clauses.push("COALESCE(current_target, '') = ''");
        }

        const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
        const result = await dbQuery(`SELECT * FROM goals ${where} ORDER BY created_at DESC`, params);

        return ok({ items: result.rows.map(mapGoalRow) });
    } catch (error) {
        return fail(`Failed to fetch goals: ${error.message}`, 500);
    }
}

export async function POST(request) {
    try {
        const auth = await requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        if (!isAdmin(auth.user) && !isManager(auth.user)) {
            return fail("forbidden", 403);
        }

        const body = await request.json();
        const name = body.name?.trim();
        const target = body.target?.trim();

        if (!name || !target) {
            return fail("name and target are required", 400);
        }

        const result = await dbQuery(
            `INSERT INTO goals (id, name, target, current_target, expect)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
            [randomUUID(), name, target, body.currentTarget?.trim() || null, body.expect?.trim() || null],
        );

        return ok({ item: mapGoalRow(result.rows[0]) }, 201);
    } catch (error) {
        return fail(`Failed to create goal: ${error.message}`, 500);
    }
}
