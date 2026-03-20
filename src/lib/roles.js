export const ROLES = {
    admin: "admin",
    manager: "manager",
    staff: "staff",
};

export const PERMISSIONS = {
    overviewView: "overview.view",
    goalsView: "goals.view",
    goalsAdd: "goals.add",
    goalsEdit: "goals.edit",
    goalsDelete: "goals.delete",
    projectsView: "projects.view",
    projectsAdd: "projects.add",
    projectsEdit: "projects.edit",
    projectsDelete: "projects.delete",
    abilitiesView: "abilities.view",
    abilitiesAdd: "abilities.add",
    abilitiesEdit: "abilities.edit",
    abilitiesDelete: "abilities.delete",
    ticketsView: "tickets.view",
    ticketsAdd: "tickets.add",
    ticketsEdit: "tickets.edit",
    ticketsDelete: "tickets.delete",
    actionPlansView: "action-plans.view",
    actionPlansAdd: "action-plans.add",
    actionPlansEdit: "action-plans.edit",
    actionPlansDelete: "action-plans.delete",
    timelineView: "timeline.view",
    usersView: "users.view",
    usersAdd: "users.add",
    usersEdit: "users.edit",
    usersDelete: "users.delete",
};

export const ROLE_LABELS = {
    [ROLES.admin]: "Admin",
    [ROLES.manager]: "Manager",
    [ROLES.staff]: "Staff",
};

export const ROLE_DEFINITIONS = [
    { name: ROLES.admin, label: ROLE_LABELS[ROLES.admin], isSuper: true },
    { name: ROLES.manager, label: ROLE_LABELS[ROLES.manager], isSuper: false },
    { name: ROLES.staff, label: ROLE_LABELS[ROLES.staff], isSuper: false },
];

export const PERMISSION_DEFINITIONS = [
    { key: PERMISSIONS.overviewView, label: "ดูหน้า Overview", path: "/" },
    { key: PERMISSIONS.goalsView, label: "Goals: View", path: "/goals" },
    { key: PERMISSIONS.goalsAdd, label: "Goals: Add", path: "" },
    { key: PERMISSIONS.goalsEdit, label: "Goals: Edit", path: "" },
    { key: PERMISSIONS.goalsDelete, label: "Goals: Delete", path: "" },
    { key: PERMISSIONS.projectsView, label: "Projects: View", path: "/projects" },
    { key: PERMISSIONS.projectsAdd, label: "Projects: Add", path: "" },
    { key: PERMISSIONS.projectsEdit, label: "Projects: Edit", path: "" },
    { key: PERMISSIONS.projectsDelete, label: "Projects: Delete", path: "" },
    { key: PERMISSIONS.abilitiesView, label: "Abilities: View", path: "/abilities" },
    { key: PERMISSIONS.abilitiesAdd, label: "Abilities: Add", path: "" },
    { key: PERMISSIONS.abilitiesEdit, label: "Abilities: Edit", path: "" },
    { key: PERMISSIONS.abilitiesDelete, label: "Abilities: Delete", path: "" },
    { key: PERMISSIONS.ticketsView, label: "Tickets: View", path: "/tickets" },
    { key: PERMISSIONS.ticketsAdd, label: "Tickets: Add", path: "" },
    { key: PERMISSIONS.ticketsEdit, label: "Tickets: Edit", path: "" },
    { key: PERMISSIONS.ticketsDelete, label: "Tickets: Delete", path: "" },
    { key: PERMISSIONS.actionPlansView, label: "Action Plans: View", path: "/action-plan" },
    { key: PERMISSIONS.actionPlansAdd, label: "Action Plans: Add", path: "" },
    { key: PERMISSIONS.actionPlansEdit, label: "Action Plans: Edit", path: "" },
    { key: PERMISSIONS.actionPlansDelete, label: "Action Plans: Delete", path: "" },
    { key: PERMISSIONS.timelineView, label: "ดู Timeline", path: "/timeline" },
    { key: PERMISSIONS.usersView, label: "Users: View", path: "/users" },
    { key: PERMISSIONS.usersAdd, label: "Users: Add", path: "" },
    { key: PERMISSIONS.usersEdit, label: "Users: Edit", path: "" },
    { key: PERMISSIONS.usersDelete, label: "Users: Delete", path: "" },
];

export const DEFAULT_ROLE_PERMISSIONS = {
    [ROLES.admin]: ["*"],
    [ROLES.manager]: [
        PERMISSIONS.overviewView,
        PERMISSIONS.goalsView,
        PERMISSIONS.goalsAdd,
        PERMISSIONS.goalsEdit,
        PERMISSIONS.goalsDelete,
        PERMISSIONS.projectsView,
        PERMISSIONS.projectsAdd,
        PERMISSIONS.projectsEdit,
        PERMISSIONS.projectsDelete,
        PERMISSIONS.abilitiesView,
        PERMISSIONS.abilitiesAdd,
        PERMISSIONS.abilitiesEdit,
        PERMISSIONS.abilitiesDelete,
        PERMISSIONS.timelineView,
    ],
    [ROLES.staff]: [
        PERMISSIONS.overviewView,
        PERMISSIONS.abilitiesView,
        PERMISSIONS.abilitiesAdd,
        PERMISSIONS.abilitiesEdit,
        PERMISSIONS.abilitiesDelete,
        PERMISSIONS.ticketsView,
        PERMISSIONS.ticketsAdd,
        PERMISSIONS.ticketsEdit,
        PERMISSIONS.ticketsDelete,
        PERMISSIONS.actionPlansView,
        PERMISSIONS.actionPlansAdd,
        PERMISSIONS.actionPlansEdit,
        PERMISSIONS.actionPlansDelete,
        PERMISSIONS.timelineView,
    ],
};

const PATH_PERMISSION_MAP = {
    "/": PERMISSIONS.overviewView,
    "/goals": PERMISSIONS.goalsView,
    "/projects": PERMISSIONS.projectsView,
    "/abilities": PERMISSIONS.abilitiesView,
    "/tickets": PERMISSIONS.ticketsView,
    "/action-plan": PERMISSIONS.actionPlansView,
    "/timeline": PERMISSIONS.timelineView,
    "/users": PERMISSIONS.usersView,
};

function normalizePermissions(user) {
    if (!user) {
        return [];
    }

    if (Array.isArray(user.effectivePermissions)) {
        return user.effectivePermissions;
    }

    if (typeof user.permission === "string" && user.permission) {
        return [user.permission];
    }

    return [];
}

function normalizeRoles(user) {
    if (!user) {
        return [];
    }

    if (Array.isArray(user.roles)) {
        return user.roles;
    }

    if (typeof user.role === "string" && user.role) {
        return [user.role];
    }

    return [];
}

export function isSuperRoleUser(user) {
    const roles = normalizeRoles(user);
    return roles.includes(ROLES.admin);
}

export function hasPermission(user, permissionKey) {
    if (isSuperRoleUser(user)) {
        return true;
    }

    const permissions = normalizePermissions(user);
    return permissions.includes(permissionKey);
}

export function canAccessPath(user, path) {
    if (!path) {
        return false;
    }

    if (isSuperRoleUser(user)) {
        return true;
    }

    const requiredPermission = PATH_PERMISSION_MAP[path];
    if (!requiredPermission) {
        return false;
    }

    return hasPermission(user, requiredPermission);
}

export function getRoleLabel(roleName) {
    return ROLE_LABELS[roleName] || roleName;
}

export const ROLE_PAGE_ACCESS = {
    [ROLES.admin]: ["/", "/goals", "/projects", "/abilities", "/tickets", "/action-plan", "/timeline", "/users"],
    [ROLES.manager]: ["/", "/goals", "/projects", "/abilities", "/timeline"],
    [ROLES.staff]: ["/", "/abilities", "/tickets", "/action-plan", "/timeline"],
};

export const NAV_ITEMS = [
    { href: "/", label: "Overview" },
    { href: "/goals", label: "Goal Management" },
    { href: "/projects", label: "Project Management" },
    { href: "/abilities", label: "Ability Management" },
    { href: "/tickets", label: "Ticket Management" },
    { href: "/action-plan", label: "Action Plan" },
    { href: "/timeline", label: "Timeline" },
    { href: "/users", label: "User Management" },
];
