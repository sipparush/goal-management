import { Pool } from "pg";
import { hashPassword } from "@/lib/password";
import { DEFAULT_ROLE_PERMISSIONS, PERMISSION_DEFINITIONS, ROLE_DEFINITIONS, ROLES } from "@/lib/roles";

let pool;
let schemaReady = false;
let schemaPromise = null;

function getPool() {
    if (!pool) {
        pool = new Pool({
            host: process.env.PGHOST,
            port: Number(process.env.PGPORT || 5432),
            user: process.env.PGUSER,
            password: process.env.PGPASSWORD,
            database: process.env.PGDATABASE,
        });
        pool.query('SELECT 1').then(() => {
            console.log('✅ Database connected:', {
                host: process.env.PGHOST,
                port: process.env.PGPORT,
                user: process.env.PGUSER,
                database: process.env.PGDATABASE,
            });
        }).catch((err) => {
            console.error('❌ Database connection failed:', err);
        });
    }

    return pool;
}

async function runRawQuery(text, params = []) {
    const activePool = getPool();
    return activePool.query(text, params);
}

async function ensureSchema() {
    if (schemaReady) {
        return;
    }

    if (schemaPromise) {
        await schemaPromise;
        return;
    }

    schemaPromise = (async () => {
        await runRawQuery(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'staff')),
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);

        await runRawQuery(`
            CREATE TABLE IF NOT EXISTS sessions (
                token TEXT PRIMARY KEY,
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);

        await runRawQuery(`
            CREATE TABLE IF NOT EXISTS roles (
                name TEXT PRIMARY KEY,
                label TEXT NOT NULL,
                is_super BOOLEAN NOT NULL DEFAULT FALSE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);

        await runRawQuery(`
            CREATE TABLE IF NOT EXISTS permissions (
                key TEXT PRIMARY KEY,
                label TEXT NOT NULL,
                page_path TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);

        await runRawQuery(`
            CREATE TABLE IF NOT EXISTS role_permissions (
                role_name TEXT NOT NULL REFERENCES roles(name) ON DELETE CASCADE,
                permission_key TEXT NOT NULL REFERENCES permissions(key) ON DELETE CASCADE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                PRIMARY KEY (role_name, permission_key)
            )
        `);

        await runRawQuery(`
            CREATE TABLE IF NOT EXISTS user_roles (
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                role_name TEXT NOT NULL REFERENCES roles(name) ON DELETE CASCADE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                PRIMARY KEY (user_id, role_name)
            )
        `);

        await runRawQuery("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE");
        await runRawQuery("ALTER TABLE goals ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL");
        await runRawQuery("ALTER TABLE projects ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES users(id)");
        await runRawQuery("ALTER TABLE projects ADD COLUMN IF NOT EXISTS assign_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL");
        await runRawQuery("ALTER TABLE abilities ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES users(id)");
        await runRawQuery("ALTER TABLE abilities ADD COLUMN IF NOT EXISTS assign_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL");
        await runRawQuery("ALTER TABLE tickets ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES users(id)");
        await runRawQuery("ALTER TABLE tickets ADD COLUMN IF NOT EXISTS assign_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL");
        await runRawQuery("ALTER TABLE abilities ALTER COLUMN project_id DROP NOT NULL");
        await runRawQuery(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_constraint
                    WHERE conname = 'abilities_project_id_fkey'
                      AND conrelid = 'abilities'::regclass
                ) THEN
                    ALTER TABLE abilities ADD CONSTRAINT abilities_project_id_fkey
                        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL;
                END IF;
            END $$
        `);

        await runRawQuery(`
            CREATE TABLE IF NOT EXISTS action_plan_rows (
                id UUID PRIMARY KEY,
                ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
                phase TEXT,
                item_no INTEGER,
                action_text TEXT NOT NULL,
                status TEXT NOT NULL,
                duration_minutes INTEGER NOT NULL DEFAULT 0,
                sort_order INTEGER NOT NULL DEFAULT 0,
                exp_start TIMESTAMPTZ,
                exp_end TIMESTAMPTZ,
                remark TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);

        await runRawQuery("ALTER TABLE action_plan_rows ADD COLUMN IF NOT EXISTS phase TEXT");
        await runRawQuery("ALTER TABLE action_plan_rows ADD COLUMN IF NOT EXISTS item_no INTEGER");
        await runRawQuery("ALTER TABLE action_plan_rows ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0");
        await runRawQuery(`
            WITH ranked AS (
                SELECT id,
                       ROW_NUMBER() OVER (PARTITION BY ticket_id ORDER BY created_at ASC, id ASC) AS seq
                FROM action_plan_rows
            )
            UPDATE action_plan_rows apr
            SET sort_order = ranked.seq
            FROM ranked
            WHERE apr.id = ranked.id
              AND (apr.sort_order = 0 OR apr.sort_order IS NULL)
        `);

        await runRawQuery(`
            CREATE TABLE IF NOT EXISTS ability_files (
                id UUID PRIMARY KEY,
                ability_id UUID REFERENCES abilities(id) ON DELETE SET NULL,
                project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
                uploader_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
                original_name TEXT NOT NULL,
                stored_name TEXT NOT NULL UNIQUE,
                mime_type TEXT,
                size_bytes INTEGER NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                orphaned_at TIMESTAMPTZ,
                deleted_at TIMESTAMPTZ
            )
        `);

        await runRawQuery(`
            CREATE TABLE IF NOT EXISTS ticket_files (
                id UUID PRIMARY KEY,
                ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
                ability_id UUID REFERENCES abilities(id) ON DELETE SET NULL,
                uploader_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
                original_name TEXT NOT NULL,
                stored_name TEXT NOT NULL UNIQUE,
                mime_type TEXT,
                size_bytes INTEGER NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                deleted_at TIMESTAMPTZ
            )
        `);

        await runRawQuery("CREATE INDEX IF NOT EXISTS idx_goals_owner_user_id ON goals(owner_user_id)");
        await runRawQuery("CREATE INDEX IF NOT EXISTS idx_projects_owner_user_id ON projects(owner_user_id)");
        await runRawQuery("CREATE INDEX IF NOT EXISTS idx_projects_assign_to_user_id ON projects(assign_to_user_id)");
        await runRawQuery("CREATE INDEX IF NOT EXISTS idx_abilities_owner_user_id ON abilities(owner_user_id)");
        await runRawQuery("CREATE INDEX IF NOT EXISTS idx_abilities_assign_to_user_id ON abilities(assign_to_user_id)");
        await runRawQuery("CREATE INDEX IF NOT EXISTS idx_tickets_owner_user_id ON tickets(owner_user_id)");
        await runRawQuery("CREATE INDEX IF NOT EXISTS idx_tickets_assign_to_user_id ON tickets(assign_to_user_id)");
        await runRawQuery("CREATE INDEX IF NOT EXISTS idx_action_plan_rows_ticket_id ON action_plan_rows(ticket_id)");
        await runRawQuery("CREATE INDEX IF NOT EXISTS idx_action_plan_rows_sort_order ON action_plan_rows(ticket_id, sort_order)");
        await runRawQuery("CREATE INDEX IF NOT EXISTS idx_ability_files_ability_id ON ability_files(ability_id)");
        await runRawQuery("CREATE INDEX IF NOT EXISTS idx_ability_files_project_id ON ability_files(project_id)");
        await runRawQuery("CREATE INDEX IF NOT EXISTS idx_ability_files_deleted_at ON ability_files(deleted_at)");
        await runRawQuery("CREATE INDEX IF NOT EXISTS idx_ability_files_orphaned_at ON ability_files(orphaned_at)");
        await runRawQuery("CREATE INDEX IF NOT EXISTS idx_ticket_files_ticket_id ON ticket_files(ticket_id)");
        await runRawQuery("CREATE INDEX IF NOT EXISTS idx_ticket_files_ability_id ON ticket_files(ability_id)");
        await runRawQuery("CREATE INDEX IF NOT EXISTS idx_ticket_files_deleted_at ON ticket_files(deleted_at)");
        await runRawQuery("CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id)");
        await runRawQuery("CREATE INDEX IF NOT EXISTS idx_user_roles_role_name ON user_roles(role_name)");
        await runRawQuery("CREATE INDEX IF NOT EXISTS idx_role_permissions_role_name ON role_permissions(role_name)");

        const defaultUsers = [
            { id: "2a2111f4-28de-4dcf-92ff-4374af4f8c31", username: "admin", role: ROLES.admin },
            { id: "31e00d76-5249-4ad1-b1cd-49032f48eec0", username: "manager", role: ROLES.manager },
            { id: "f1032b9f-e129-4488-9f8e-5fda6caef5de", username: "user1", role: ROLES.staff },
            { id: "42cd2dbb-6aa8-4ca7-bcd6-fcfef5cc95de", username: "user2", role: ROLES.staff },
            { id: "1e7543fd-0026-4f38-b839-fc7ec57cf018", username: "user3", role: ROLES.staff },
        ];

        const defaultPasswordHash = hashPassword("password");

        for (const user of defaultUsers) {
            await runRawQuery(
                `INSERT INTO users (id, username, password_hash, role)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (username) DO NOTHING`,
                [user.id, user.username, defaultPasswordHash, user.role],
            );
        }

        for (const role of ROLE_DEFINITIONS) {
            await runRawQuery(
                `INSERT INTO roles (name, label, is_super)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (name) DO UPDATE
                 SET label = EXCLUDED.label,
                     is_super = EXCLUDED.is_super`,
                [role.name, role.label, role.isSuper],
            );
        }

        for (const permission of PERMISSION_DEFINITIONS) {
            await runRawQuery(
                `INSERT INTO permissions (key, label, page_path)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (key) DO UPDATE
                 SET label = EXCLUDED.label,
                     page_path = EXCLUDED.page_path`,
                [permission.key, permission.label, permission.path],
            );
        }

        // Backward-compatible migration from legacy *.manage permissions to CRUD permissions.
        await runRawQuery(
            `INSERT INTO role_permissions (role_name, permission_key)
             SELECT rp.role_name, m.new_key
             FROM role_permissions rp
             JOIN (
                VALUES
                    ('goals.manage', 'goals.view'),
                    ('goals.manage', 'goals.add'),
                    ('goals.manage', 'goals.edit'),
                    ('goals.manage', 'goals.delete'),
                    ('projects.manage', 'projects.view'),
                    ('projects.manage', 'projects.add'),
                    ('projects.manage', 'projects.edit'),
                    ('projects.manage', 'projects.delete'),
                    ('abilities.manage', 'abilities.view'),
                    ('abilities.manage', 'abilities.add'),
                    ('abilities.manage', 'abilities.edit'),
                    ('abilities.manage', 'abilities.delete'),
                    ('tickets.manage', 'tickets.view'),
                    ('tickets.manage', 'tickets.add'),
                    ('tickets.manage', 'tickets.edit'),
                    ('tickets.manage', 'tickets.delete'),
                    ('action-plans.manage', 'action-plans.view'),
                    ('action-plans.manage', 'action-plans.add'),
                    ('action-plans.manage', 'action-plans.edit'),
                    ('action-plans.manage', 'action-plans.delete'),
                    ('users.manage', 'users.view'),
                    ('users.manage', 'users.add'),
                    ('users.manage', 'users.edit'),
                    ('users.manage', 'users.delete')
             ) AS m(old_key, new_key) ON rp.permission_key = m.old_key
             ON CONFLICT (role_name, permission_key) DO NOTHING`,
        );

        await runRawQuery("DELETE FROM role_permissions WHERE permission_key LIKE '%.manage'");
        await runRawQuery("DELETE FROM permissions WHERE key LIKE '%.manage'");

        for (const roleName of Object.keys(DEFAULT_ROLE_PERMISSIONS)) {
            if (roleName === ROLES.admin) {
                continue;
            }

            const permissions = DEFAULT_ROLE_PERMISSIONS[roleName] || [];
            for (const permissionKey of permissions) {
                if (permissionKey === "*") {
                    continue;
                }

                await runRawQuery(
                    `INSERT INTO role_permissions (role_name, permission_key)
                     VALUES ($1, $2)
                     ON CONFLICT (role_name, permission_key) DO NOTHING`,
                    [roleName, permissionKey],
                );
            }
        }

        await runRawQuery(
            `INSERT INTO user_roles (user_id, role_name)
             SELECT u.id, u.role
             FROM users u
             LEFT JOIN user_roles ur ON ur.user_id = u.id AND ur.role_name = u.role
             WHERE ur.user_id IS NULL`,
        );

        // Backfill rule requested in /sawork:
        // existing projects -> owner=manager, assign_to=sipparush.l
        // existing abilities/tickets with null owner/assign -> sipparush.l
        const managerResult = await runRawQuery("SELECT id FROM users WHERE username = 'manager' LIMIT 1");
        const sipparushResult = await runRawQuery("SELECT id FROM users WHERE username = 'sipparush.l' LIMIT 1");

        if (managerResult.rowCount > 0 && sipparushResult.rowCount > 0) {
            const managerId = managerResult.rows[0].id;
            const sipparushId = sipparushResult.rows[0].id;

            await runRawQuery(
                `UPDATE projects
                 SET owner_user_id = $1,
                     assign_to_user_id = $2,
                     response_person = 'sipparush.l'
                 WHERE owner_user_id IS NULL OR assign_to_user_id IS NULL`,
                [managerId, sipparushId],
            );

            await runRawQuery(
                `UPDATE abilities
                 SET owner_user_id = COALESCE(owner_user_id, $1),
                     assign_to_user_id = COALESCE(assign_to_user_id, $1),
                     response_person = CASE
                        WHEN response_person IS NULL OR response_person = '' THEN 'sipparush.l'
                        ELSE response_person
                     END
                 WHERE owner_user_id IS NULL OR assign_to_user_id IS NULL`,
                [sipparushId],
            );

            await runRawQuery(
                `UPDATE tickets
                 SET owner_user_id = COALESCE(owner_user_id, $1),
                     assign_to_user_id = COALESCE(assign_to_user_id, $1),
                     response_person = CASE
                        WHEN response_person IS NULL OR response_person = '' THEN 'sipparush.l'
                        ELSE response_person
                     END
                 WHERE owner_user_id IS NULL OR assign_to_user_id IS NULL`,
                [sipparushId],
            );
        }

        schemaReady = true;
    })();

    await schemaPromise;
}

export async function dbQuery(text, params = []) {
    await ensureSchema();
    return runRawQuery(text, params);
}
