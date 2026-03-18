import { dbQuery } from "@/lib/db";
import { fail } from "@/lib/api-response";
import { authenticateUser, createSessionResponse } from "@/lib/auth-server";

export async function POST(request) {
    try {
        const body = await request.json();
        const username = body.username?.trim();
        const password = body.password?.trim();

        if (!username || !password) {
            return fail("username and password are required", 400);
        }

        const user = await authenticateUser(username, password);
        if (!user) {
            return fail("invalid credentials", 401);
        }

        const { token, response } = createSessionResponse(user);
        await dbQuery("INSERT INTO sessions (token, user_id) VALUES ($1, $2)", [token, user.id]);

        return response;
    } catch (error) {
        return fail(`failed to login: ${error.message}`, 500);
    }
}
