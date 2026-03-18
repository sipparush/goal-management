import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";
import { clearSessionCookie, SESSION_COOKIE } from "@/lib/auth-server";

function getToken(request) {
    const cookieHeader = request.headers.get("cookie") || "";
    const parts = cookieHeader.split(";").map((item) => item.trim());

    for (const part of parts) {
        const [key, ...rest] = part.split("=");
        if (key === SESSION_COOKIE) {
            return rest.join("=");
        }
    }

    return "";
}

export async function POST(request) {
    const token = getToken(request);

    if (token) {
        await dbQuery("DELETE FROM sessions WHERE token = $1", [token]);
    }

    const response = NextResponse.json({ success: true });
    clearSessionCookie(response);
    return response;
}
