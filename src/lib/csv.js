function escapeCsvValue(value) {
    const stringValue = String(value ?? "");
    if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
        return `"${stringValue.replaceAll('"', '""')}"`;
    }

    return stringValue;
}

export function downloadCsv(filename, rows) {
    if (!rows || rows.length === 0) {
        return;
    }

    const headers = Object.keys(rows[0]);
    const lines = [headers.join(",")];

    for (const row of rows) {
        const line = headers.map((key) => escapeCsvValue(row[key])).join(",");
        lines.push(line);
    }

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
