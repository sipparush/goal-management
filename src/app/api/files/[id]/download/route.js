import { dbQuery } from "@/lib/db";
import { fail } from "@/lib/api-response";
import { isAdmin, isManager, isStaff, requireAuth } from "@/lib/auth-server";
import { readStoredFile } from "@/lib/file-storage";

function canOwnerAccessFileRow(fileRow, userId) {
    if (fileRow.ability_owner_user_id && fileRow.ability_owner_user_id === userId) {
        return true;
    }

    if (fileRow.project_owner_user_id && fileRow.project_owner_user_id === userId) {
        return true;
    }

    return false;
}

export async function GET(request, { params }) {
    try {
        const auth = await requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        if (!isAdmin(auth.user) && !isManager(auth.user) && !isStaff(auth.user)) {
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

        if (!isAdmin(auth.user) && !canOwnerAccessFileRow(fileRow, auth.user.id)) {
            return fail("file not found", 404);
        }

        const buffer = await readStoredFile(fileRow.stored_name);
        const mimeType = fileRow.mime_type || "text/csv";

        return new Response(buffer, {
            status: 200,
            headers: {
                "Content-Type": mimeType,
                "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileRow.original_name)}`,
                "Cache-Control": "no-store",
            },
        });
    } catch (error) {
        return fail(`Failed to download file: ${error.message}`, 500);
    }
}
