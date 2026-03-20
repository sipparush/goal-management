import { dbQuery } from "@/lib/db";
import { ok, fail } from "@/lib/api-response";
import { hasEffectivePermission, isAdmin, requireAuth } from "@/lib/auth-server";
import { PERMISSIONS } from "@/lib/roles";
import { mapGoalRow, mapProjectRow } from "@/lib/server-records";

export async function GET(request) {
    try {
        const auth = await requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        if (!hasEffectivePermission(auth.user, PERMISSIONS.overviewView)) {
            return fail("forbidden", 403);
        }

        if (isAdmin(auth.user)) {
            const [goalsResult, projectsResult, projectCountResult, abilityCountResult, ticketCountResult] = await Promise.all([
                dbQuery("SELECT * FROM goals ORDER BY created_at DESC"),
                dbQuery(
                    `SELECT p.*, g.name AS goal_name
                     FROM projects p
                     JOIN goals g ON g.id = p.goal_id
                     ORDER BY p.start_date ASC, p.created_at DESC`,
                ),
                dbQuery("SELECT COUNT(*)::int AS count FROM projects"),
                dbQuery("SELECT COUNT(*)::int AS count FROM abilities"),
                dbQuery("SELECT COUNT(*)::int AS count FROM tickets"),
            ]);

            return ok({
                summary: {
                    goals: goalsResult.rowCount,
                    projects: Number(projectCountResult.rows[0].count || 0),
                    abilities: Number(abilityCountResult.rows[0].count || 0),
                    tickets: Number(ticketCountResult.rows[0].count || 0),
                },
                goals: goalsResult.rows.map(mapGoalRow),
                projects: projectsResult.rows.map(mapProjectRow),
            });
        }

        const params = [auth.user.id];

        const [
            goalsResult,
            projectsResult,
            projectCountResult,
            abilityCountResult,
            ticketCountResult,
        ] = await Promise.all([
            dbQuery(
                `SELECT DISTINCT g.*
                 FROM goals g
                 JOIN projects p ON p.goal_id = g.id
                 WHERE (p.owner_user_id = $1 OR p.assign_to_user_id = $1)
                 ORDER BY g.created_at DESC`,
                params,
            ),
            dbQuery(
                `SELECT p.*, g.name AS goal_name
                 FROM projects p
                 JOIN goals g ON g.id = p.goal_id
                 WHERE (p.owner_user_id = $1 OR p.assign_to_user_id = $1)
                 ORDER BY p.start_date ASC, p.created_at DESC`,
                params,
            ),
            dbQuery("SELECT COUNT(*)::int AS count FROM projects WHERE (owner_user_id = $1 OR assign_to_user_id = $1)", params),
            dbQuery(
                `SELECT COUNT(*)::int AS count
                 FROM abilities a
                 JOIN projects p ON p.id = a.project_id
                 WHERE (p.owner_user_id = $1 OR p.assign_to_user_id = $1)`,
                params,
            ),
            dbQuery(
                `SELECT COUNT(*)::int AS count
                 FROM tickets t
                 JOIN abilities a ON a.id = t.ability_id
                 JOIN projects p ON p.id = a.project_id
                 WHERE (p.owner_user_id = $1 OR p.assign_to_user_id = $1)`,
                params,
            ),
        ]);

        return ok({
            summary: {
                goals: goalsResult.rowCount,
                projects: Number(projectCountResult.rows[0].count || 0),
                abilities: Number(abilityCountResult.rows[0].count || 0),
                tickets: Number(ticketCountResult.rows[0].count || 0),
            },
            goals: goalsResult.rows.map(mapGoalRow),
            projects: projectsResult.rows.map(mapProjectRow),
        });
    } catch (error) {
        return fail(`Failed to load overview data: ${error.message}`, 500);
    }
}
