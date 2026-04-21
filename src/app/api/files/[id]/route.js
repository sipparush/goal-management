import fs from "fs/promises";
import { dbQuery } from "@/lib/db";
import { ok, fail } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-server";
import { hasEffectivePermission } from "@/lib/auth-server";
import { PERMISSIONS } from "@/lib/roles";
import { getStoredPath } from "@/lib/file-storage";
import { canAccessManagedFile, getManagedFileById } from "@/lib/file-records";

export async function DELETE(request, { params }) {
    try {
        const auth = await requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        const { id } = await params;

        const fileRow = await getManagedFileById(id);
        if (!fileRow) {
            return fail("file not found", 404);
        }

        const requiredPermission = fileRow.source_type === "ticket" ? PERMISSIONS.ticketsEdit : PERMISSIONS.abilitiesEdit;
        if (!hasEffectivePermission(auth.user, requiredPermission)) {
            return fail("forbidden", 403);
        }

        if (!canAccessManagedFile(fileRow, auth.user)) {
            return fail("forbidden", 403);
        }

        const tableName = fileRow.source_type === "ticket" ? "ticket_files" : "ability_files";
        await dbQuery(`UPDATE ${tableName} SET deleted_at = NOW() WHERE id = $1`, [id]);

        try {
            await fs.unlink(getStoredPath(fileRow.stored_name));
        } catch {
            // Ignore if already missing.
        }

        return ok({ id });
    } catch (error) {
        return fail(`Failed to delete file: ${error.message}`, 500);
    }
}
