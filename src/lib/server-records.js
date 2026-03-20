import { computeDurationDays, computeStatus } from "@/lib/status";

function isoDate(value) {
    if (!value) {
        return "";
    }

    if (typeof value === "string") {
        return value.slice(0, 10);
    }

    return new Date(value).toISOString().slice(0, 10);
}

export function mapGoalRow(row) {
    return {
        id: row.id,
        name: row.name,
        target: row.target,
        currentTarget: row.current_target || "",
        expect: row.expect || "",
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export function mapProjectRow(row) {
    const startDate = isoDate(row.start_date);
    const endDate = isoDate(row.end_date);

    return {
        id: row.id,
        goalId: row.goal_id,
        goalName: row.goal_name || "",
        ownerUserId: row.owner_user_id || "",
        assignToUserId: row.assign_to_user_id || "",
        name: row.name,
        target: row.target,
        responsePerson: row.response_person,
        startDate,
        endDate,
        durationDays: computeDurationDays(startDate, endDate),
        status: computeStatus(endDate),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export function mapAbilityRow(row) {
    const startDate = isoDate(row.start_date);
    const endDate = isoDate(row.end_date);

    return {
        id: row.id,
        projectId: row.project_id || "",
        projectName: row.project_name || "",
        ownerUserId: row.owner_user_id || "",
        assignToUserId: row.assign_to_user_id || "",
        name: row.name,
        target: row.target,
        responsePerson: row.response_person,
        startDate,
        endDate,
        durationDays: computeDurationDays(startDate, endDate),
        status: computeStatus(endDate),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export function mapTicketRow(row) {
    const startDate = isoDate(row.start_date);
    const endDate = isoDate(row.end_date);

    return {
        id: row.id,
        abilityId: row.ability_id,
        abilityName: row.ability_name || "",
        ownerUserId: row.owner_user_id || "",
        assignToUserId: row.assign_to_user_id || "",
        title: row.title,
        target: row.target,
        responsePerson: row.response_person,
        startDate,
        endDate,
        durationDays: computeDurationDays(startDate, endDate),
        status: computeStatus(endDate),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
