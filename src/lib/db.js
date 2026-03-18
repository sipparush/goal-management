import { Pool } from "pg";
import { hashPassword } from "@/lib/password";
import { ROLES } from "@/lib/roles";

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

        await runRawQuery("ALTER TABLE projects ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES users(id)");
        await runRawQuery("ALTER TABLE abilities ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES users(id)");
        await runRawQuery("ALTER TABLE tickets ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES users(id)");

        await runRawQuery(`
            CREATE TABLE IF NOT EXISTS action_plan_rows (
                id UUID PRIMARY KEY,
                ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
                action_text TEXT NOT NULL,
                status TEXT NOT NULL,
                duration_minutes INTEGER NOT NULL DEFAULT 0,
                exp_start TIMESTAMPTZ,
                exp_end TIMESTAMPTZ,
                remark TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        `);

        await runRawQuery("CREATE INDEX IF NOT EXISTS idx_projects_owner_user_id ON projects(owner_user_id)");
        await runRawQuery("CREATE INDEX IF NOT EXISTS idx_abilities_owner_user_id ON abilities(owner_user_id)");
        await runRawQuery("CREATE INDEX IF NOT EXISTS idx_tickets_owner_user_id ON tickets(owner_user_id)");
        await runRawQuery("CREATE INDEX IF NOT EXISTS idx_action_plan_rows_ticket_id ON action_plan_rows(ticket_id)");

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

        schemaReady = true;
    })();

    await schemaPromise;
}

export async function dbQuery(text, params = []) {
    await ensureSchema();
    return runRawQuery(text, params);
}
