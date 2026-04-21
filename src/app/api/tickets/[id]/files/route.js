import { randomUUID } from "crypto";
import { dbQuery } from "@/lib/db";
import { ok, fail } from "@/lib/api-response";
import { hasEffectivePermission, requireAuth } from "@/lib/auth-server";
import { PERMISSIONS } from "@/lib/roles";
import {
    buildStoredName,
    cleanupExpiredOrphanFiles,
    saveFormFileToDisk,
    validateUploadFile,
} from "@/lib/file-storage";
import { getTicketForUser, mapManagedFileRow } from "@/lib/file-records";

export async function GET(request, { params }) {
    try {
        const auth = await requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        if (!hasEffectivePermission(auth.user, PERMISSIONS.ticketsView)) {
            return fail("forbidden", 403);
        }

        await cleanupExpiredOrphanFiles();

        const { id } = await params;
        const ticket = await getTicketForUser(id, auth.user);
        if (!ticket) {
            return fail("ticket not found", 404);
        }

        const result = await dbQuery(
            `SELECT tf.id,
                    'ticket'::text AS source_type,
                    tf.ability_id,
                    a.project_id,
                    tf.ticket_id,
                    t.title AS ticket_title,
                    a.name AS ability_name,
                    tf.original_name,
                    tf.mime_type,
                    tf.size_bytes,
                    tf.created_at
             FROM ticket_files tf
             JOIN tickets t ON t.id = tf.ticket_id
             LEFT JOIN abilities a ON a.id = tf.ability_id
             WHERE tf.ticket_id = $1
               AND tf.deleted_at IS NULL
             ORDER BY tf.created_at DESC`,
            [id],
        );

        return ok({ items: result.rows.map(mapManagedFileRow) });
    } catch (error) {
        return fail(`Failed to list ticket files: ${error.message}`, 500);
    }
}

export async function POST(request, { params }) {
    try {
        const auth = await requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        if (!hasEffectivePermission(auth.user, PERMISSIONS.ticketsEdit)) {
            return fail("forbidden", 403);
        }

        await cleanupExpiredOrphanFiles();

        const { id } = await params;
        const ticket = await getTicketForUser(id, auth.user);
        if (!ticket) {
            return fail("ticket not found", 404);
        }

        const formData = await request.formData();
        const file = formData.get("file");
        const validationError = validateUploadFile(file);
        if (validationError) {
            return fail(validationError, 400);
        }

        const storedName = buildStoredName(file.name);
        const bytesWritten = await saveFormFileToDisk(file, storedName);

        const insertResult = await dbQuery(
            `INSERT INTO ticket_files
             (id, ticket_id, ability_id, uploader_user_id, original_name, stored_name, mime_type, size_bytes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [
                randomUUID(),
                id,
                ticket.ability_id,
                auth.user.id,
                file.name,
                storedName,
                file.type || "application/octet-stream",
                bytesWritten,
            ],
        );

        return ok({ item: mapManagedFileRow({
            ...insertResult.rows[0],
            source_type: "ticket",
            project_id: null,
            ticket_title: ticket.title,
            ability_name: null,
        }) }, 201);
    } catch (error) {
        return fail(`Failed to upload ticket file: ${error.message}`, 500);
    }
}