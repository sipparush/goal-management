function normalizeDate(value) {
    if (!value) {
        return null;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
}

export function computeDurationDays(startDate, endDate) {
    const start = normalizeDate(startDate);
    const end = normalizeDate(endDate);

    if (!start || !end) {
        return 0;
    }

    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) {
        return 0;
    }

    return Math.ceil(diffMs / (1000 * 60 * 60 * 24)) || 1;
}

export function computeStatus(endDate) {
    const dueDate = normalizeDate(endDate);

    if (!dueDate) {
        return "in-time";
    }

    const today = new Date();
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dueOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

    return todayOnly.getTime() <= dueOnly.getTime() ? "in-time" : "delay";
}
