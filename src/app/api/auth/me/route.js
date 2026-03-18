import { ok } from "@/lib/api-response";
import { getAuthUser } from "@/lib/auth-server";

export async function GET(request) {
    const user = await getAuthUser(request);
    return ok({ user });
}
