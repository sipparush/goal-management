import { fail } from "@/lib/api-response";
import { isAdmin, isManager, isStaff, requireAuth } from "@/lib/auth-server";
import { readStoredFile } from "@/lib/file-storage";
import { canAccessManagedFile, getManagedFileById } from "@/lib/file-records";

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
        const fileRow = await getManagedFileById(id);
        if (!fileRow) {
            return fail("file not found", 404);
        }

        if (!canAccessManagedFile(fileRow, auth.user)) {
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
