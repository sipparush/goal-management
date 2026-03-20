import { dbQuery } from "@/lib/db";
import { ok, fail } from "@/lib/api-response";
import { canDeleteUsers, canEditUsers, requireAuth } from "@/lib/auth-server";
import { cleanupExpiredOrphanFiles } from "@/lib/file-storage";
import { hashPassword } from "@/lib/password";
import { ROLES } from "@/lib/roles";

function mapUserRow(row) {
    const roles = Array.isArray(row.roles) && row.roles.length > 0 ? row.roles : [row.role].filter(Boolean);

    return {
        id: row.id,
        username: row.username,
        role: roles[0] || "",
        roles,
        isActive: row.is_active,
        createdAt: row.created_at,
        activeSessions: 0,
    };
}

function normalizeRolesInput(body) {
    if (Array.isArray(body.roles)) {
        return body.roles;
    }

    if (body.role) {
        return [body.role];
    }

    return [];
}

function validateRoles(roles) {
    if (!Array.isArray(roles) || roles.length === 0) {
        return "at least one role is required";
    }

    const invalidRole = roles.find((roleName) => !Object.values(ROLES).includes(roleName));
    if (invalidRole) {
        return `invalid role: ${invalidRole}`;
    }

    return "";
}

async function loadUserRow(id) {
    const result = await dbQuery(
        `SELECT u.id, u.username, u.role, u.is_active, u.created_at,
                COALESCE(array_remove(array_agg(DISTINCT ur.role_name), NULL), ARRAY[]::TEXT[]) AS roles
         FROM users u
         LEFT JOIN user_roles ur ON ur.user_id = u.id
         WHERE u.id = $1
         GROUP BY u.id`,
        [id],
    );

    return result;
}

export async function PUT(request, { params }) {
    try {
        const auth = await requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        if (!canEditUsers(auth.user)) {
            return fail("forbidden", 403);
        }

        const { id } = await params;
        const body = await request.json();
        const action = body.action;

        if (!["role", "set_roles", "toggle", "reset_password"].includes(action)) {
            return fail("invalid action", 400);
        }

        if (auth.user.id === id && (action === "role" || action === "set_roles" || action === "toggle")) {
            return fail("admin cannot change own roles or disable themselves", 403);
        }

        if (action === "role" || action === "set_roles") {
            const roles = [...new Set(normalizeRolesInput(body))];
            const roleValidation = validateRoles(roles);

            if (roleValidation) {
                return fail(roleValidation, 400);
            }

            const userResult = await dbQuery("SELECT id FROM users WHERE id = $1", [id]);
            if (userResult.rowCount === 0) {
                return fail("user not found", 404);
            }

            await dbQuery("DELETE FROM user_roles WHERE user_id = $1", [id]);
            for (const roleName of roles) {
                await dbQuery(
                    `INSERT INTO user_roles (user_id, role_name)
                     VALUES ($1, $2)
                     ON CONFLICT (user_id, role_name) DO NOTHING`,
                    [id, roleName],
                );
            }

            await dbQuery("UPDATE users SET role = $1 WHERE id = $2", [roles[0], id]);
            const result = await loadUserRow(id);

            return ok({ item: mapUserRow(result.rows[0]) });
        }

        if (action === "toggle") {
            const result = await dbQuery(
                "UPDATE users SET is_active = NOT is_active WHERE id = $1 RETURNING id, username, role, is_active, created_at",
                [id],
            );

            if (result.rowCount === 0) {
                return fail("user not found", 404);
            }

            if (!result.rows[0].is_active) {
                await dbQuery("DELETE FROM sessions WHERE user_id = $1", [id]);
            }

            const userResult = await loadUserRow(id);
            return ok({ item: mapUserRow(userResult.rows[0]) });
        }

        if (action === "reset_password") {
            const result = await dbQuery(
                "UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id, username, role, is_active, created_at",
                [hashPassword("password"), id],
            );

            if (result.rowCount === 0) {
                return fail("user not found", 404);
            }

            await dbQuery("DELETE FROM sessions WHERE user_id = $1", [id]);

            const userResult = await loadUserRow(id);
            return ok({ item: mapUserRow(userResult.rows[0]) });
        }

        return fail("invalid action", 400);
    } catch (error) {
        return fail(`Failed to update user: ${error.message}`, 500);
    }
}

export async function DELETE(request, { params }) {
    try {
        const auth = await requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        if (!canDeleteUsers(auth.user)) {
            return fail("forbidden", 403);
        }

        const { id } = await params;
        if (auth.user.id === id) {
            return fail("admin cannot delete themselves", 403);
        }

        const userResult = await dbQuery("SELECT id FROM users WHERE id = $1", [id]);
        if (userResult.rowCount === 0) {
            return fail("user not found", 404);
        }

        await dbQuery("UPDATE goals SET owner_user_id = NULL WHERE owner_user_id = $1", [id]);
        await dbQuery("UPDATE projects SET owner_user_id = NULL WHERE owner_user_id = $1", [id]);
        await dbQuery("UPDATE abilities SET owner_user_id = NULL WHERE owner_user_id = $1", [id]);
        await dbQuery("UPDATE tickets SET owner_user_id = NULL WHERE owner_user_id = $1", [id]);
        await dbQuery("DELETE FROM sessions WHERE user_id = $1", [id]);
        await dbQuery("DELETE FROM users WHERE id = $1", [id]);
        await cleanupExpiredOrphanFiles();

        return ok({ success: true });
    } catch (error) {
        return fail(`Failed to delete user: ${error.message}`, 500);
    }
}
