"use client";

import Link from "next/link";
import { canAccessPath, getRoleLabel } from "@/lib/roles";
import { useAppData } from "@/context/AppDataContext";

export default function RoleGate({ path, children }) {
    const { state, loadingUser } = useAppData();

    if (loadingUser) {
        return (
            <section className="empty-state">
                <h2>กำลังตรวจสอบผู้ใช้...</h2>
            </section>
        );
    }

    if (!state.user) {
        return (
            <section className="empty-state">
                <h2>กรุณาเข้าสู่ระบบ</h2>
                <p>ระบบต้อง login ก่อนใช้งาน</p>
                <p>
                    <Link href="/login">ไปหน้า Login</Link>
                </p>
            </section>
        );
    }

    const allowed = canAccessPath(state.user, path);

    if (allowed) {
        return children;
    }

    return (
        <section className="empty-state">
            <h2>Access limited for {(state.roles || []).map((role) => getRoleLabel(role)).join(", ") || "No Role"}</h2>
            <p>Role นี้ไม่สามารถเข้าหน้านี้ได้ กรุณาเปลี่ยน role เพื่อเข้าถึงข้อมูลที่ต้องการ</p>
        </section>
    );
}
