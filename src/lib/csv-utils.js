export function parseCsv(text) {
    const rows = [];
    let current = "";
    let row = [];
    let inQuotes = false;

    const pushCell = () => {
        row.push(current);
        current = "";
    };

    const pushRow = () => {
        if (row.length > 1 || (row.length === 1 && row[0] !== "")) {
            rows.push(row.map((cell) => cell.trim()));
        }
        row = [];
    };

    for (let i = 0; i < text.length; i += 1) {
        const char = text[i];
        const next = text[i + 1];

        if (char === '"') {
            if (inQuotes && next === '"') {
                current += '"';
                i += 1;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (char === "," && !inQuotes) {
            pushCell();
            continue;
        }

        if ((char === "\n" || char === "\r") && !inQuotes) {
            if (char === "\r" && next === "\n") {
                i += 1;
            }
            pushCell();
            pushRow();
            continue;
        }

        current += char;
    }

    if (current.length > 0 || row.length > 0) {
        pushCell();
        pushRow();
    }

    return rows;
}

export function normalizeHeader(header) {
    return String(header || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/\./g, "");
}
