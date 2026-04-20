import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { dbQuery } from "@/lib/db";

export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_EXTENSIONS = [".csv", ".xlsx", ".jpg", ".jpeg", ".png", ".gif", ".webp"];

const UPLOAD_ROOT = path.join(process.cwd(), "uploads", "ability-results");

export function getExtension(fileName) {
    const ext = path.extname(fileName || "").toLowerCase();
    return ext;
}

export function validateUploadFile(file) {
    if (!file) {
        return "file is required";
    }

    if (typeof file.size !== "number" || file.size <= 0) {
        return "file is empty";
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        return `file size exceeds ${MAX_UPLOAD_SIZE_BYTES} bytes`;
    }

    const extension = getExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
        return `file extension ${extension || "(none)"} is not allowed`;
    }

    return "";
}

export async function ensureUploadDirectory() {
    await fs.mkdir(UPLOAD_ROOT, { recursive: true });
}

export function buildStoredName(originalName) {
    const extension = getExtension(originalName);
    return `${Date.now()}-${randomUUID()}${extension}`;
}

export function getStoredPath(storedName) {
    return path.join(UPLOAD_ROOT, storedName);
}

export async function saveFormFileToDisk(file, storedName) {
    await ensureUploadDirectory();

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(getStoredPath(storedName), buffer);
    return buffer.length;
}

export async function readStoredFile(storedName) {
    return fs.readFile(getStoredPath(storedName));
}

export async function cleanupExpiredOrphanFiles() {
    const staleResult = await dbQuery(
        `SELECT id, stored_name
         FROM ability_files
         WHERE orphaned_at IS NOT NULL
           AND deleted_at IS NULL
           AND orphaned_at <= NOW() - INTERVAL '30 days'`,
    );

    for (const row of staleResult.rows) {
        try {
            await fs.unlink(getStoredPath(row.stored_name));
        } catch {
            // File can be missing if it was manually removed; we still mark metadata as deleted.
        }

        await dbQuery("UPDATE ability_files SET deleted_at = NOW() WHERE id = $1", [row.id]);
    }
}
