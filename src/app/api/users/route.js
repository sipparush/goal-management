import { randomUUID } from "crypto";
import { dbQuery } from "@/lib/db";
import { ok, fail } from "@/lib/api-response";
import { canAddUsers, canViewUsers, requireAuth } from "@/lib/auth-server";
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
        activeSessions: Number(row.active_sessions || 0),
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

export async function GET(request) {
    try {
        const auth = await requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        if (!canViewUsers(auth.user)) {
            return fail("forbidden", 403);
        }

        const result = await dbQuery(
            `SELECT u.id, u.username, u.role, u.is_active, u.created_at,
                    COUNT(DISTINCT s.token) AS active_sessions,
                    COALESCE(array_remove(array_agg(DISTINCT ur.role_name), NULL), ARRAY[]::TEXT[]) AS roles
             FROM users u
             LEFT JOIN sessions s ON s.user_id = u.id
             LEFT JOIN user_roles ur ON ur.user_id = u.id
             GROUP BY u.id
             ORDER BY u.created_at ASC`,
        );

        return ok({ items: result.rows.map(mapUserRow) });
    } catch (error) {
        return fail(`Failed to fetch users: ${error.message}`, 500);
    }
}

export async function POST(request) {
    try {
        const auth = await requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        if (!canAddUsers(auth.user)) {
            return fail("forbidden", 403);
        }

        const body = await request.json();
        const username = body.username?.trim();
        const roles = [...new Set(normalizeRolesInput(body))];

        if (!username) {
            return fail("username is required", 400);
        }

        const roleValidation = validateRoles(roles);
        if (roleValidation) {
            return fail(roleValidation, 400);
        }

        const defaultHash = hashPassword("password");
        const userId = randomUUID();

        await dbQuery(
            `INSERT INTO users (id, username, password_hash, role, is_active)
             VALUES ($1, $2, $3, $4, TRUE)`,
            [userId, username, defaultHash, roles[0]],
        );

        for (const roleName of roles) {
            await dbQuery(
                `INSERT INTO user_roles (user_id, role_name)
                 VALUES ($1, $2)
                 ON CONFLICT (user_id, role_name) DO NOTHING`,
                [userId, roleName],
            );
        }

        const reloadResult = await dbQuery(
            `SELECT u.id, u.username, u.role, u.is_active, u.created_at,
                    0::int AS active_sessions,
                    COALESCE(array_remove(array_agg(DISTINCT ur.role_name), NULL), ARRAY[]::TEXT[]) AS roles
             FROM users u
             LEFT JOIN user_roles ur ON ur.user_id = u.id
             WHERE u.id = $1
             GROUP BY u.id`,
            [userId],
        );

        return ok({ item: mapUserRow(reloadResult.rows[0]) }, 201);
    } catch (error) {
        if (error.code === "23505") {
            return fail("username already exists", 409);
        }

        return fail(`Failed to create user: ${error.message}`, 500);
    }
}
