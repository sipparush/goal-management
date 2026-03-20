import { randomUUID } from "crypto";
import { dbQuery } from "@/lib/db";
import { ok, fail } from "@/lib/api-response";
import { hasEffectivePermission, isAdmin, requireAuth } from "@/lib/auth-server";
import { parseCsv, normalizeHeader } from "@/lib/csv-utils";
import { validateUploadFile } from "@/lib/file-storage";
import { PERMISSIONS } from "@/lib/roles";

const REQUIRED_HEADERS = ["phase", "no", "action", "status", "duration", "start", "end", "remark"];

async function canAccessTicket(ticketId, user) {
    const ticketResult = isAdmin(user)
        ? await dbQuery("SELECT id FROM tickets WHERE id = $1", [ticketId])
        : await dbQuery("SELECT id FROM tickets WHERE id = $1 AND (owner_user_id = $2 OR assign_to_user_id = $2)", [ticketId, user.id]);
    return ticketResult.rowCount > 0;
}

function parseDateTimeOrNull(value) {
    const raw = String(value || "").trim();
    if (!raw) {
        return null;
    }

    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.toISOString();
}

export async function POST(request) {
    try {
        const auth = await requireAuth(request);
        if (auth.error) {
            return auth.error;
        }

        if (!hasEffectivePermission(auth.user, PERMISSIONS.actionPlansAdd)) {
            return fail("forbidden", 403);
        }

        const formData = await request.formData();
        const ticketId = String(formData.get("ticketId") || "").trim();
        const file = formData.get("file");

        if (!ticketId) {
            return fail("ticketId is required", 400);
        }

        const validationError = validateUploadFile(file);
        if (validationError) {
            return fail(validationError, 400);
        }

        const owns = await canAccessTicket(ticketId, auth.user);
        if (!owns) {
            return fail("forbidden", 403);
        }

        const csvText = await file.text();
        const parsedRows = parseCsv(csvText);

        if (parsedRows.length < 2) {
            return fail("csv must contain header and at least one data row", 400);
        }

        const header = parsedRows[0].map(normalizeHeader);
        const headerIndex = {};
        header.forEach((name, index) => {
            headerIndex[name] = index;
        });

        for (const required of REQUIRED_HEADERS) {
            if (!(required in headerIndex)) {
                return fail(`missing required column: ${required}`, 400);
            }
        }

        const maxOrderResult = await dbQuery("SELECT COALESCE(MAX(sort_order), 0) AS max_order FROM action_plan_rows WHERE ticket_id = $1", [
            ticketId,
        ]);
        let nextOrder = Number(maxOrderResult.rows[0].max_order || 0) + 1;

        let insertedCount = 0;
        const failures = [];

        for (let rowIndex = 1; rowIndex < parsedRows.length; rowIndex += 1) {
            const row = parsedRows[rowIndex];
            const rowNumber = rowIndex + 1;

            const phase = row[headerIndex.phase] || null;
            const itemNoRaw = row[headerIndex.no] || "";
            const action = String(row[headerIndex.action] || "").trim();
            const status = String(row[headerIndex.status] || "").trim();
            const durationRaw = String(row[headerIndex.duration] || "").trim();
            const startRaw = row[headerIndex.start] || "";
            const endRaw = row[headerIndex.end] || "";
            const remark = String(row[headerIndex.remark] || "").trim() || null;

            const itemNo = itemNoRaw ? Number(itemNoRaw) : null;
            const duration = Number(durationRaw || 0);
            const start = parseDateTimeOrNull(startRaw);
            const end = parseDateTimeOrNull(endRaw);

            if (!action || !status) {
                failures.push({ row: rowNumber, reason: "action and status are required" });
                continue;
            }

            if ((itemNoRaw && !Number.isInteger(itemNo)) || (!Number.isFinite(duration) || duration < 0)) {
                failures.push({ row: rowNumber, reason: "invalid number format in No or duration" });
                continue;
            }

            if ((String(startRaw || "").trim() && !start) || (String(endRaw || "").trim() && !end)) {
                failures.push({ row: rowNumber, reason: "invalid date format in start or end" });
                continue;
            }

            await dbQuery(
                `INSERT INTO action_plan_rows
                 (id, ticket_id, phase, item_no, action_text, status, duration_minutes, sort_order, exp_start, exp_end, remark)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                [
                    randomUUID(),
                    ticketId,
                    phase ? String(phase).trim() : null,
                    itemNo,
                    action,
                    status,
                    Math.floor(duration),
                    nextOrder,
                    start,
                    end,
                    remark,
                ],
            );

            nextOrder += 1;
            insertedCount += 1;
        }

        return ok({
            insertedCount,
            failedCount: failures.length,
            failures,
        });
    } catch (error) {
        return fail(`Failed to import action plan rows: ${error.message}`, 500);
    }
}
