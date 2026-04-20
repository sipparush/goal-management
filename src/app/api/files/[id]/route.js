import fs from "fs/promises";
import { dbQuery } from "@/lib/db";
import { ok, fail } from "@/lib/api-response";
import { isAdmin, requireAuth } from "@/lib/auth-server";
import { hasEffectivePermission } from "@/lib/auth-server";
import { PERMISSIONS } from "@/lib/roles";
import { getStoredPath } from "@/lib/file-storage";

export async function DELETE(request, { params }) {
    try {
        const auth = await requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        if (!hasEffectivePermission(auth.user, PERMISSIONS.abilitiesEdit)) {
            return fail("forbidden", 403);
        }

        const { id } = await params;

        const result = await dbQuery(
            `SELECT af.*, a.owner_user_id AS ability_owner_user_id, p.owner_user_id AS project_owner_user_id
             FROM ability_files af
             LEFT JOIN abilities a ON a.id = af.ability_id
             LEFT JOIN projects p ON p.id = af.project_id
             WHERE af.id = $1
               AND af.deleted_at IS NULL`,
            [id],
        );

        if (result.rowCount === 0) {
            return fail("file not found", 404);
        }

        const fileRow = result.rows[0];

        // Non-admins can only delete files belonging to abilities/projects they own
        if (!isAdmin(auth.user)) {
            const isAbilityOwner = fileRow.ability_owner_user_id === auth.user.id;
            const isProjectOwner = fileRow.project_owner_user_id === auth.user.id;
            const isUploader = fileRow.uploader_user_id === auth.user.id;
            if (!isAbilityOwner && !isProjectOwner && !isUploader) {
                return fail("forbidden", 403);
            }
        }

        // Soft-delete the metadata record
        await dbQuery("UPDATE ability_files SET deleted_at = NOW() WHERE id = $1", [id]);

        // Remove the file from disk (best-effort)
        try {
            await fs.unlink(getStoredPath(fileRow.stored_name));
        } catch {
            // Ignore if already missing
        }

        return ok({ id });
    } catch (error) {
        return fail(`Failed to delete file: ${error.message}`, 500);
    }
}
