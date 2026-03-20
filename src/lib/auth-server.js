import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";
import { PERMISSIONS, ROLE_LABELS, ROLES } from "@/lib/roles";
import { verifyPassword } from "@/lib/password";

export const SESSION_COOKIE = "pm_session";

function getCookieFromHeader(request, key) {
    const cookieHeader = request.headers.get("cookie") || "";
    const parts = cookieHeader.split(";").map((item) => item.trim());

    for (const part of parts) {
        const [cookieKey, ...rest] = part.split("=");
        if (cookieKey === key) {
            return rest.join("=");
        }
    }

    return "";
}

function shapeUser(row) {
    if (!row) {
        return null;
    }

    const roles = Array.isArray(row.roles) && row.roles.length > 0 ? row.roles : [row.role].filter(Boolean);
    const effectivePermissions = Array.isArray(row.effectivePermissions) ? row.effectivePermissions : [];
    const primaryRole = roles[0] || "";

    return {
        id: row.id,
        username: row.username,
        role: primaryRole,
        roleLabel: ROLE_LABELS[primaryRole] || primaryRole,
        roles,
        roleLabels: roles.map((roleName) => ROLE_LABELS[roleName] || roleName),
        effectivePermissions,
    };
}

async function getUserRoles(userId, fallbackRole) {
    const roleResult = await dbQuery(
        `SELECT ur.role_name
         FROM user_roles ur
         WHERE ur.user_id = $1
         ORDER BY ur.role_name ASC`,
        [userId],
    );

    if (roleResult.rowCount > 0) {
        return roleResult.rows.map((row) => row.role_name);
    }

    return fallbackRole ? [fallbackRole] : [];
}

async function getEffectivePermissions(roleNames) {
    if (!Array.isArray(roleNames) || roleNames.length === 0) {
        return [];
    }

    if (roleNames.includes(ROLES.admin)) {
        return ["*"];
    }

    const permissionResult = await dbQuery(
        `SELECT DISTINCT rp.permission_key
         FROM role_permissions rp
         WHERE rp.role_name = ANY($1::TEXT[])
         ORDER BY rp.permission_key ASC`,
        [roleNames],
    );

    return permissionResult.rows.map((row) => row.permission_key);
}

export async function getAuthUser(request) {
    const token = getCookieFromHeader(request, SESSION_COOKIE);
    if (!token) {
        return null;
    }

    const result = await dbQuery(
        `SELECT u.id, u.username, u.role
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token = $1 AND u.is_active = TRUE`,
        [token],
    );

    if (result.rowCount === 0) {
        return null;
    }

    const baseRow = result.rows[0];
    const roles = await getUserRoles(baseRow.id, baseRow.role);
    const effectivePermissions = await getEffectivePermissions(roles);

    return shapeUser({ ...baseRow, roles, effectivePermissions });
}

export async function requireAuth(request) {
    const user = await getAuthUser(request);

    if (!user) {
        return {
            user: null,
            error: NextResponse.json({ error: "unauthorized" }, { status: 401 }),
        };
    }

    return { user, error: null };
}

export function isAdmin(user) {
    const roles = Array.isArray(user?.roles) ? user.roles : [user?.role].filter(Boolean);
    return roles.includes(ROLES.admin);
}

export function isManager(user) {
    const roles = Array.isArray(user?.roles) ? user.roles : [user?.role].filter(Boolean);
    return roles.includes(ROLES.manager);
}

export function isStaff(user) {
    const roles = Array.isArray(user?.roles) ? user.roles : [user?.role].filter(Boolean);
    return roles.includes(ROLES.staff);
}

export function ownsItem(user, ownerUserId) {
    return user?.id === ownerUserId;
}

export function hasEffectivePermission(user, permissionKey) {
    if (isAdmin(user)) {
        return true;
    }

    const permissions = Array.isArray(user?.effectivePermissions) ? user.effectivePermissions : [];
    return permissions.includes("*") || permissions.includes(permissionKey);
}

export function canManageUsers(user) {
    return hasEffectivePermission(user, PERMISSIONS.usersEdit);
}

export function canViewUsers(user) {
    return hasEffectivePermission(user, PERMISSIONS.usersView);
}

export function canAddUsers(user) {
    return hasEffectivePermission(user, PERMISSIONS.usersAdd);
}

export function canEditUsers(user) {
    return hasEffectivePermission(user, PERMISSIONS.usersEdit);
}

export function canDeleteUsers(user) {
    return hasEffectivePermission(user, PERMISSIONS.usersDelete);
}

export function createSessionResponse(user) {
    const token = randomUUID();

    const response = NextResponse.json({ user: shapeUser(user) });
    response.cookies.set(SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    });

    return { token, response };
}

export function clearSessionCookie(response) {
    response.cookies.set(SESSION_COOKIE, "", {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });
}

export async function authenticateUser(username, password) {
    const result = await dbQuery(
        "SELECT id, username, role, password_hash, is_active FROM users WHERE username = $1",
        [username],
    );

    if (result.rowCount === 0) {
        return null;
    }

    const user = result.rows[0];
    if (!verifyPassword(password, user.password_hash)) {
        return null;
    }

    if (!user.is_active) {
        return null;
    }

    return user;
}
