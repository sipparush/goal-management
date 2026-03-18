import { dbQuery } from "@/lib/db";
import { ok, fail } from "@/lib/api-response";
import { isStaff, requireAuth } from "@/lib/auth-server";
import { mapAbilityRow, mapGoalRow, mapProjectRow } from "@/lib/server-records";

export async function GET(request) {
    try {
        const auth = await requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        const staffProjectScope = isStaff(auth.user) ? "WHERE p.owner_user_id = $1" : "";
        const staffAbilityScope = isStaff(auth.user) ? "WHERE a.owner_user_id = $1" : "";
        const scopedParams = isStaff(auth.user) ? [auth.user.id] : [];

        const [goalResult, projectResult, abilityResult] = await Promise.all([
            dbQuery("SELECT * FROM goals ORDER BY created_at DESC"),
            dbQuery(
                `SELECT p.*, g.name AS goal_name FROM projects p JOIN goals g ON g.id = p.goal_id ${staffProjectScope} ORDER BY p.created_at DESC`,
                scopedParams,
            ),
            dbQuery(
                `SELECT a.*, p.name AS project_name FROM abilities a JOIN projects p ON p.id = a.project_id ${staffAbilityScope} ORDER BY a.created_at DESC`,
                scopedParams,
            ),
        ]);

        return ok({
            goals: goalResult.rows.map(mapGoalRow),
            projects: projectResult.rows.map(mapProjectRow),
            abilities: abilityResult.rows.map(mapAbilityRow),
        });
    } catch (error) {
        return fail(`Failed to load bootstrap data: ${error.message}`, 500);
    }
}
