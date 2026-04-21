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
import { getAbilityForUser, mapManagedFileRow } from "@/lib/file-records";

export async function GET(request, { params }) {
    try {
        const auth = await requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        if (!hasEffectivePermission(auth.user, PERMISSIONS.abilitiesView)) {
            return fail("forbidden", 403);
        }

        await cleanupExpiredOrphanFiles();

        const { id } = await params;
        const ability = await getAbilityForUser(id, auth.user);
        if (!ability) {
            return fail("ability not found", 404);
        }

                const result = await dbQuery(
                        `SELECT *
                         FROM (
                                 SELECT af.id,
                                                'ability'::text AS source_type,
                                                af.ability_id,
                                                af.project_id,
                                                NULL::uuid AS ticket_id,
                                                NULL::text AS ticket_title,
                                                a.name AS ability_name,
                                                af.original_name,
                                                af.mime_type,
                                                af.size_bytes,
                                                af.created_at
                                 FROM ability_files af
                                 LEFT JOIN abilities a ON a.id = af.ability_id
                                 WHERE af.ability_id = $1
                                     AND af.deleted_at IS NULL

                                 UNION ALL

                                 SELECT tf.id,
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
                                 WHERE tf.ability_id = $1
                                     AND tf.deleted_at IS NULL
                         ) files
                         ORDER BY created_at DESC`,
                        [id],
                );

                return ok({ items: result.rows.map(mapManagedFileRow) });
    } catch (error) {
        return fail(`Failed to list ability files: ${error.message}`, 500);
    }
}

export async function POST(request, { params }) {
    try {
        const auth = await requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        if (!hasEffectivePermission(auth.user, PERMISSIONS.abilitiesEdit)) {
            return fail("forbidden", 403);
        }

        await cleanupExpiredOrphanFiles();

        const { id } = await params;
        const ability = await getAbilityForUser(id, auth.user);
        if (!ability) {
            return fail("ability not found", 404);
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
            `INSERT INTO ability_files
             (id, ability_id, project_id, uploader_user_id, original_name, stored_name, mime_type, size_bytes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [
                randomUUID(),
                id,
                ability.project_id || null,
                auth.user.id,
                file.name,
                storedName,
                file.type || "text/csv",
                bytesWritten,
            ],
        );

        return ok({ item: mapManagedFileRow({ ...insertResult.rows[0], source_type: "ability", ticket_id: null, ticket_title: null, ability_name: null }) }, 201);
    } catch (error) {
        return fail(`Failed to upload ability file: ${error.message}`, 500);
    }
}
