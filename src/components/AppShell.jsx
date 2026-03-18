"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, ROLE_LABELS, ROLE_PAGE_ACCESS } from "@/lib/roles";
import { useAppData } from "@/context/AppDataContext";

function canOpen(role, href) {
    return ROLE_PAGE_ACCESS[role]?.includes(href);
}

export default function AppShell({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const { state, logout, loadingUser } = useAppData();

    const onLogout = async () => {
        await logout();
        router.push("/login");
    };

    if (pathname === "/login") {
        return <div className="app-bg login-layout">{children}</div>;
    }

    return (
        <div className="app-bg">
            <header className="topbar">
                <div>
                    <p className="eyebrow">PROJECT MANAGEMENT HUB</p>
                    <h1 className="title">Goal to Ticket Control Center</h1>
                </div>
                <div className="role-box">
                    <span>User</span>
                    <strong>{loadingUser ? "Loading..." : state.user?.username || "Guest"}</strong>
                    <span>Role: {ROLE_LABELS[state.selectedRole] || "-"}</span>
                    {state.user ? (
                        <button type="button" className="btn-secondary" onClick={onLogout}>
                            Logout
                        </button>
                    ) : null}
                </div>
            </header>

            <nav className="nav-grid" aria-label="Main navigation">
                {NAV_ITEMS.filter((item) => canOpen(state.selectedRole, item.href)).map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`nav-item ${pathname === item.href ? "active" : ""}`}
                    >
                        {item.label}
                    </Link>
                ))}
            </nav>

            <main className="content-card">{children}</main>
        </div>
    );
}
