export const ROLES = {
    admin: "admin",
    manager: "manager",
    staff: "staff",
};

export const ROLE_LABELS = {
    [ROLES.admin]: "Admin",
    [ROLES.manager]: "Manager",
    [ROLES.staff]: "Staff",
};

export const ROLE_PAGE_ACCESS = {
    [ROLES.admin]: ["/", "/goals", "/projects", "/abilities", "/tickets", "/action-plan", "/timeline"],
    [ROLES.manager]: ["/", "/goals", "/timeline"],
    [ROLES.staff]: ["/", "/projects", "/abilities", "/tickets", "/action-plan", "/timeline"],
};

export const NAV_ITEMS = [
    { href: "/", label: "Overview" },
    { href: "/goals", label: "Goal Management" },
    { href: "/projects", label: "Project Management" },
    { href: "/abilities", label: "Ability Management" },
    { href: "/tickets", label: "Ticket Management" },
    { href: "/action-plan", label: "Action Plan" },
    { href: "/timeline", label: "Timeline" },
];
