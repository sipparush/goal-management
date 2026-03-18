import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";
import { ROLE_LABELS, ROLES } from "@/lib/roles";
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

    return {
        id: row.id,
        username: row.username,
        role: row.role,
        roleLabel: ROLE_LABELS[row.role] || row.role,
    };
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
     WHERE s.token = $1`,
        [token],
    );

    if (result.rowCount === 0) {
        return null;
    }

    return shapeUser(result.rows[0]);
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
    return user?.role === ROLES.admin;
}

export function isManager(user) {
    return user?.role === ROLES.manager;
}

export function isStaff(user) {
    return user?.role === ROLES.staff;
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
    const result = await dbQuery("SELECT id, username, role, password_hash FROM users WHERE username = $1", [username]);

    if (result.rowCount === 0) {
        return null;
    }

    const user = result.rows[0];
    if (!verifyPassword(password, user.password_hash)) {
        return null;
    }

    return user;
}
