"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { requestJson } from "@/lib/client-api";

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    const loadUser = async () => {
        try {
            const data = await requestJson("/api/auth/me");
            setUser(data.user || null);
        } catch {
            setUser(null);
        } finally {
            setLoadingUser(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    const value = useMemo(
        () => ({
            state: {
                user,
                selectedRole: user?.role || "",
                roles: Array.isArray(user?.roles) ? user.roles : [],
                effectivePermissions: Array.isArray(user?.effectivePermissions) ? user.effectivePermissions : [],
            },
            loadingUser,
            login: async (username, password) => {
                const result = await requestJson("/api/auth/login", {
                    method: "POST",
                    body: JSON.stringify({ username, password }),
                });
                // Reload from /api/auth/me to ensure multi-role and effective permissions are current.
                await loadUser();
                return result.user;
            },
            logout: async () => {
                await requestJson("/api/auth/logout", { method: "POST" });
                setUser(null);
            },
            refreshUser: loadUser,
        }),
        [user, loadingUser],
    );

    return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
    const context = useContext(AppDataContext);

    if (!context) {
        throw new Error("useAppData must be used within AppDataProvider");
    }

    return context;
}
