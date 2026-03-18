"use client";

import { AppDataProvider } from "@/context/AppDataContext";
import AppShell from "@/components/AppShell";

export default function AppProviders({ children }) {
    return (
        <AppDataProvider>
            <AppShell>{children}</AppShell>
        </AppDataProvider>
    );
}
