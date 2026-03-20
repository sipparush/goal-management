import { dbQuery } from "@/lib/db";
import { ok, fail } from "@/lib/api-response";
import { hasEffectivePermission, isAdmin, requireAuth } from "@/lib/auth-server";
import { PERMISSIONS } from "@/lib/roles";
import { mapAbilityRow, mapGoalRow, mapProjectRow } from "@/lib/server-records";

export async function GET(request) {
    try {
        const auth = await requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        if (isAdmin(auth.user)) {
            const [goalResult, projectResult, abilityResult, usersResult] = await Promise.all([
                dbQuery("SELECT * FROM goals ORDER BY created_at DESC"),
                dbQuery(
                    `SELECT p.*, g.name AS goal_name
                     FROM projects p
                     JOIN goals g ON g.id = p.goal_id
                     ORDER BY p.created_at DESC`,
                ),
                dbQuery(
                    `SELECT a.*, p.name AS project_name
                     FROM abilities a
                     LEFT JOIN projects p ON p.id = a.project_id
                     ORDER BY a.created_at DESC`,
                ),
                dbQuery("SELECT id, username, role FROM users WHERE is_active = TRUE ORDER BY username ASC"),
            ]);

            return ok({
                goals: goalResult.rows.map(mapGoalRow),
                projects: projectResult.rows.map(mapProjectRow),
                abilities: abilityResult.rows.map(mapAbilityRow),
                users: usersResult.rows,
            });
        }

        const canViewGoals = hasEffectivePermission(auth.user, PERMISSIONS.goalsView);
        const canViewProjects = hasEffectivePermission(auth.user, PERMISSIONS.projectsView);
        const canViewAbilities = hasEffectivePermission(auth.user, PERMISSIONS.abilitiesView);
        const canUseTicketForm = hasEffectivePermission(auth.user, PERMISSIONS.ticketsAdd)
            || hasEffectivePermission(auth.user, PERMISSIONS.ticketsEdit);

        if (!canViewGoals && !canViewProjects && !canViewAbilities && !canUseTicketForm) {
            return fail("forbidden", 403);
        }

        const goalsWhere = canViewGoals ? "WHERE owner_user_id = $1" : "WHERE 1 = 0";
        const projectWhere = canViewProjects
            ? "WHERE (p.owner_user_id = $1 OR p.assign_to_user_id = $1)"
            : "WHERE 1 = 0";
        const abilityWhere = (canViewAbilities || canUseTicketForm)
            ? "WHERE (a.owner_user_id = $1 OR a.assign_to_user_id = $1)"
            : "WHERE 1 = 0";
        const scopedParams = [auth.user.id];
        const goalParams = canViewGoals ? scopedParams : [];

        const [goalResult, projectResult, abilityResult, usersResult] = await Promise.all([
            dbQuery(`SELECT * FROM goals ${goalsWhere} ORDER BY created_at DESC`, goalParams),
            dbQuery(
                `SELECT p.*, g.name AS goal_name FROM projects p JOIN goals g ON g.id = p.goal_id ${projectWhere} ORDER BY p.created_at DESC`,
                scopedParams,
            ),
            dbQuery(
                `SELECT a.*, p.name AS project_name FROM abilities a LEFT JOIN projects p ON p.id = a.project_id ${abilityWhere} ORDER BY a.created_at DESC`,
                scopedParams,
            ),
            dbQuery("SELECT id, username, role FROM users WHERE is_active = TRUE ORDER BY username ASC"),
        ]);

        return ok({
            goals: goalResult.rows.map(mapGoalRow),
            projects: projectResult.rows.map(mapProjectRow),
            abilities: abilityResult.rows.map(mapAbilityRow),
            users: usersResult.rows,
        });
    } catch (error) {
        return fail(`Failed to load bootstrap data: ${error.message}`, 500);
    }
}
