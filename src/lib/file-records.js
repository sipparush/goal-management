import { dbQuery } from "@/lib/db";
import { isAdmin } from "@/lib/auth-server";

export function mapManagedFileRow(row) {
    return {
        id: row.id,
        sourceType: row.source_type,
        abilityId: row.ability_id || "",
        projectId: row.project_id || "",
        ticketId: row.ticket_id || "",
        ticketTitle: row.ticket_title || "",
        abilityName: row.ability_name || "",
        originalName: row.original_name,
        mimeType: row.mime_type || "application/octet-stream",
        sizeBytes: row.size_bytes,
        createdAt: row.created_at,
        downloadUrl: `/api/files/${row.id}/download`,
    };
}

export async function getAbilityForUser(abilityId, user) {
    const result = isAdmin(user)
        ? await dbQuery("SELECT id, project_id FROM abilities WHERE id = $1", [abilityId])
        : await dbQuery("SELECT id, project_id FROM abilities WHERE id = $1 AND (owner_user_id = $2 OR assign_to_user_id = $2)", [abilityId, user.id]);

    if (result.rowCount === 0) {
        return null;
    }

    return result.rows[0];
}

export async function getTicketForUser(ticketId, user) {
    const result = isAdmin(user)
        ? await dbQuery("SELECT id, ability_id, title FROM tickets WHERE id = $1", [ticketId])
        : await dbQuery(
            "SELECT id, ability_id, title FROM tickets WHERE id = $1 AND (owner_user_id = $2 OR assign_to_user_id = $2)",
            [ticketId, user.id],
        );

    if (result.rowCount === 0) {
        return null;
    }

    return result.rows[0];
}

export async function getManagedFileById(fileId) {
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
                    af.uploader_user_id,
                    af.original_name,
                    af.stored_name,
                    af.mime_type,
                    af.size_bytes,
                    af.created_at,
                    af.deleted_at,
                    a.owner_user_id AS ability_owner_user_id,
                    a.assign_to_user_id AS ability_assign_to_user_id,
                    p.owner_user_id AS project_owner_user_id,
                    p.assign_to_user_id AS project_assign_to_user_id,
                    NULL::uuid AS ticket_owner_user_id,
                    NULL::uuid AS ticket_assign_to_user_id
             FROM ability_files af
             LEFT JOIN abilities a ON a.id = af.ability_id
             LEFT JOIN projects p ON p.id = af.project_id

             UNION ALL

             SELECT tf.id,
                    'ticket'::text AS source_type,
                    tf.ability_id,
                    a.project_id,
                    tf.ticket_id,
                    t.title AS ticket_title,
                    a.name AS ability_name,
                    tf.uploader_user_id,
                    tf.original_name,
                    tf.stored_name,
                    tf.mime_type,
                    tf.size_bytes,
                    tf.created_at,
                    tf.deleted_at,
                    a.owner_user_id AS ability_owner_user_id,
                    a.assign_to_user_id AS ability_assign_to_user_id,
                    p.owner_user_id AS project_owner_user_id,
                    p.assign_to_user_id AS project_assign_to_user_id,
                    t.owner_user_id AS ticket_owner_user_id,
                    t.assign_to_user_id AS ticket_assign_to_user_id
             FROM ticket_files tf
             LEFT JOIN tickets t ON t.id = tf.ticket_id
             LEFT JOIN abilities a ON a.id = tf.ability_id
             LEFT JOIN projects p ON p.id = a.project_id
         ) files
         WHERE id = $1
           AND deleted_at IS NULL`,
        [fileId],
    );

    if (result.rowCount === 0) {
        return null;
    }

    return result.rows[0];
}

export function canAccessManagedFile(fileRow, user) {
    if (isAdmin(user)) {
        return true;
    }

    return [
        fileRow.ability_owner_user_id,
        fileRow.ability_assign_to_user_id,
        fileRow.project_owner_user_id,
        fileRow.project_assign_to_user_id,
        fileRow.ticket_owner_user_id,
        fileRow.ticket_assign_to_user_id,
        fileRow.uploader_user_id,
    ].includes(user.id);
}