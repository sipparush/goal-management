import { dbQuery } from "@/lib/db";
import { ok, fail } from "@/lib/api-response";
import { canEditUsers, requireAuth } from "@/lib/auth-server";
import { PERMISSION_DEFINITIONS, ROLE_DEFINITIONS, ROLES } from "@/lib/roles";

function normalizeIncomingMatrix(rolePermissions) {
    const matrix = typeof rolePermissions === "object" && rolePermissions ? rolePermissions : {};
    const roleNames = ROLE_DEFINITIONS.map((role) => role.name).filter((roleName) => roleName !== ROLES.admin);
    const validPermissionKeys = new Set(PERMISSION_DEFINITIONS.map((item) => item.key));

    return roleNames.reduce((acc, roleName) => {
        const raw = Array.isArray(matrix[roleName]) ? matrix[roleName] : [];
        acc[roleName] = [...new Set(raw.filter((permissionKey) => validPermissionKeys.has(permissionKey)))];
        return acc;
    }, {});
}

export async function GET(request) {
    try {
        const auth = await requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        if (!canEditUsers(auth.user)) {
            return fail("forbidden", 403);
        }

        const [rolesResult, permissionsResult, rolePermissionResult] = await Promise.all([
            dbQuery("SELECT name, label, is_super FROM roles ORDER BY name ASC"),
            dbQuery("SELECT key, label, page_path FROM permissions ORDER BY key ASC"),
            dbQuery("SELECT role_name, permission_key FROM role_permissions ORDER BY role_name ASC, permission_key ASC"),
        ]);

        const rolePermissions = {};
        for (const row of rolePermissionResult.rows) {
            if (!rolePermissions[row.role_name]) {
                rolePermissions[row.role_name] = [];
            }
            rolePermissions[row.role_name].push(row.permission_key);
        }

        return ok({
            roles: rolesResult.rows,
            permissions: permissionsResult.rows.map((item) => ({ key: item.key, label: item.label, path: item.page_path || "" })),
            rolePermissions,
        });
    } catch (error) {
        return fail(`Failed to fetch permission matrix: ${error.message}`, 500);
    }
}

export async function PUT(request) {
    try {
        const auth = await requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        if (!canEditUsers(auth.user)) {
            return fail("forbidden", 403);
        }

        const body = await request.json();
        const matrix = normalizeIncomingMatrix(body.rolePermissions);

        const configurableRoles = ROLE_DEFINITIONS.map((role) => role.name).filter((name) => name !== ROLES.admin);

        for (const roleName of configurableRoles) {
            await dbQuery("DELETE FROM role_permissions WHERE role_name = $1", [roleName]);

            for (const permissionKey of matrix[roleName] || []) {
                await dbQuery(
                    `INSERT INTO role_permissions (role_name, permission_key)
                     VALUES ($1, $2)
                     ON CONFLICT (role_name, permission_key) DO NOTHING`,
                    [roleName, permissionKey],
                );
            }
        }

        return ok({ success: true });
    } catch (error) {
        return fail(`Failed to update permission matrix: ${error.message}`, 500);
    }
}
