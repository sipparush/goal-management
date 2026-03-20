import { dbQuery } from "@/lib/db";
import { ok, fail } from "@/lib/api-response";
import { hasEffectivePermission, isAdmin, requireAuth } from "@/lib/auth-server";
import { cleanupExpiredOrphanFiles } from "@/lib/file-storage";
import { PERMISSIONS } from "@/lib/roles";

function mapFileRow(row) {
    return {
        id: row.id,
        abilityId: row.ability_id,
        projectId: row.project_id,
        abilityName: row.ability_name || "",
        originalName: row.original_name,
        mimeType: row.mime_type || "text/csv",
        sizeBytes: row.size_bytes,
        createdAt: row.created_at,
        downloadUrl: `/api/files/${row.id}/download`,
    };
}

async function canAccessProject(projectId, user) {
    const result = isAdmin(user)
        ? await dbQuery("SELECT id FROM projects WHERE id = $1", [projectId])
        : await dbQuery("SELECT id FROM projects WHERE id = $1 AND (owner_user_id = $2 OR assign_to_user_id = $2)", [projectId, user.id]);

    return result.rowCount > 0;
}

export async function GET(request, { params }) {
    try {
        const auth = await requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        if (!hasEffectivePermission(auth.user, PERMISSIONS.projectsView)) {
            return fail("forbidden", 403);
        }

        await cleanupExpiredOrphanFiles();

        const { id } = await params;
        const accessAllowed = await canAccessProject(id, auth.user);
        if (!accessAllowed) {
            return fail("project not found", 404);
        }

        const result = await dbQuery(
            `SELECT af.*, a.name AS ability_name
             FROM ability_files af
             LEFT JOIN abilities a ON a.id = af.ability_id
             WHERE af.project_id = $1
               AND af.deleted_at IS NULL
             ORDER BY af.created_at DESC`,
            [id],
        );

        return ok({ items: result.rows.map(mapFileRow) });
    } catch (error) {
        return fail(`Failed to list project files: ${error.message}`, 500);
    }
}
