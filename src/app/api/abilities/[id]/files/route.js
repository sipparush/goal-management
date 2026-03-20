import { randomUUID } from "crypto";
import { dbQuery } from "@/lib/db";
import { ok, fail } from "@/lib/api-response";
import { hasEffectivePermission, isAdmin, requireAuth } from "@/lib/auth-server";
import { PERMISSIONS } from "@/lib/roles";
import {
    buildStoredName,
    cleanupExpiredOrphanFiles,
    saveFormFileToDisk,
    validateUploadFile,
} from "@/lib/file-storage";

function mapFileRow(row) {
    return {
        id: row.id,
        abilityId: row.ability_id,
        projectId: row.project_id,
        originalName: row.original_name,
        mimeType: row.mime_type || "text/csv",
        sizeBytes: row.size_bytes,
        createdAt: row.created_at,
        downloadUrl: `/api/files/${row.id}/download`,
    };
}

async function getAbilityForUser(abilityId, user) {
    const result = isAdmin(user)
        ? await dbQuery("SELECT id, project_id FROM abilities WHERE id = $1", [abilityId])
        : await dbQuery("SELECT id, project_id FROM abilities WHERE id = $1 AND (owner_user_id = $2 OR assign_to_user_id = $2)", [abilityId, user.id]);

    if (result.rowCount === 0) {
        return null;
    }

    return result.rows[0];
}

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
             FROM ability_files
             WHERE ability_id = $1
               AND deleted_at IS NULL
             ORDER BY created_at DESC`,
            [id],
        );

        return ok({ items: result.rows.map(mapFileRow) });
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

        return ok({ item: mapFileRow(insertResult.rows[0]) }, 201);
    } catch (error) {
        return fail(`Failed to upload ability file: ${error.message}`, 500);
    }
}
