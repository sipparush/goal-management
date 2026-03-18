import { dbQuery } from "@/lib/db";
import { ok, fail } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-server";

export async function GET(request) {
    try {
        const auth = await requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        await dbQuery("SELECT 1");
        return ok({ status: "ok" });
    } catch (error) {
        return fail(`database unavailable: ${error.message}`, 500);
    }
}
