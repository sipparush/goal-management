"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import RoleGate from "@/components/RoleGate";
import { useAppData } from "@/context/AppDataContext";
import { requestJson } from "@/lib/client-api";
import { PERMISSIONS, ROLE_DEFINITIONS, ROLES, getRoleLabel, hasPermission } from "@/lib/roles";

const MODULE_PERMISSION_MATRIX = [
    {
        module: "Goals",
        actions: [
            { label: "View", key: PERMISSIONS.goalsView },
            { label: "Add", key: PERMISSIONS.goalsAdd },
            { label: "Edit", key: PERMISSIONS.goalsEdit },
            { label: "Delete", key: PERMISSIONS.goalsDelete },
        ],
    },
    {
        module: "Projects",
        actions: [
            { label: "View", key: PERMISSIONS.projectsView },
            { label: "Add", key: PERMISSIONS.projectsAdd },
            { label: "Edit", key: PERMISSIONS.projectsEdit },
            { label: "Delete", key: PERMISSIONS.projectsDelete },
        ],
    },
    {
        module: "Abilities",
        actions: [
            { label: "View", key: PERMISSIONS.abilitiesView },
            { label: "Add", key: PERMISSIONS.abilitiesAdd },
            { label: "Edit", key: PERMISSIONS.abilitiesEdit },
            { label: "Delete", key: PERMISSIONS.abilitiesDelete },
        ],
    },
    {
        module: "Tickets",
        actions: [
            { label: "View", key: PERMISSIONS.ticketsView },
            { label: "Add", key: PERMISSIONS.ticketsAdd },
            { label: "Edit", key: PERMISSIONS.ticketsEdit },
            { label: "Delete", key: PERMISSIONS.ticketsDelete },
        ],
    },
    {
        module: "Action Plans",
        actions: [
            { label: "View", key: PERMISSIONS.actionPlansView },
            { label: "Add", key: PERMISSIONS.actionPlansAdd },
            { label: "Edit", key: PERMISSIONS.actionPlansEdit },
            { label: "Delete", key: PERMISSIONS.actionPlansDelete },
        ],
    },
    {
        module: "Users",
        actions: [
            { label: "View", key: PERMISSIONS.usersView },
            { label: "Add", key: PERMISSIONS.usersAdd },
            { label: "Edit", key: PERMISSIONS.usersEdit },
            { label: "Delete", key: PERMISSIONS.usersDelete },
        ],
    },
];

const initialForm = {
    username: "",
    roles: [ROLES.staff],
};

function toggleArrayValue(list, value) {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function expandLegacyManagePermissions(rolePermissions) {
    const legacyToCrudMap = {
        "goals.manage": [PERMISSIONS.goalsView, PERMISSIONS.goalsAdd, PERMISSIONS.goalsEdit, PERMISSIONS.goalsDelete],
        "projects.manage": [PERMISSIONS.projectsView, PERMISSIONS.projectsAdd, PERMISSIONS.projectsEdit, PERMISSIONS.projectsDelete],
        "abilities.manage": [PERMISSIONS.abilitiesView, PERMISSIONS.abilitiesAdd, PERMISSIONS.abilitiesEdit, PERMISSIONS.abilitiesDelete],
        "tickets.manage": [PERMISSIONS.ticketsView, PERMISSIONS.ticketsAdd, PERMISSIONS.ticketsEdit, PERMISSIONS.ticketsDelete],
        "action-plans.manage": [
            PERMISSIONS.actionPlansView,
            PERMISSIONS.actionPlansAdd,
            PERMISSIONS.actionPlansEdit,
            PERMISSIONS.actionPlansDelete,
        ],
        "users.manage": [PERMISSIONS.usersView, PERMISSIONS.usersAdd, PERMISSIONS.usersEdit, PERMISSIONS.usersDelete],
    };

    const normalized = {};
    for (const [roleName, permissionList] of Object.entries(rolePermissions || {})) {
        const source = Array.isArray(permissionList) ? permissionList : [];
        const expanded = new Set(source);

        for (const permissionKey of source) {
            const mappedKeys = legacyToCrudMap[permissionKey] || [];
            for (const mappedKey of mappedKeys) {
                expanded.add(mappedKey);
            }
        }

        normalized[roleName] = [...expanded];
    }

    return normalized;
}

export default function UserManagementPage() {
    const { state } = useAppData();
    const canAddUser = hasPermission(state.user, PERMISSIONS.usersAdd);
    const canEditUser = hasPermission(state.user, PERMISSIONS.usersEdit);
    const canDeleteUser = hasPermission(state.user, PERMISSIONS.usersDelete);
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState(ROLE_DEFINITIONS);
    const [rolePermissions, setRolePermissions] = useState({});
    const [form, setForm] = useState(initialForm);
    const [editingRoleId, setEditingRoleId] = useState("");
    const [editingRoles, setEditingRoles] = useState([]);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [savingMatrix, setSavingMatrix] = useState(false);

    const configurableRoles = useMemo(
        () => roles.filter((role) => role.name !== ROLES.admin).map((role) => role.name),
        [roles],
    );

    const loadUsers = useCallback(async () => {
        if (!state.user) {
            return;
        }

        setLoading(true);
        try {
            setError("");
            const data = await requestJson("/api/users");
            setUsers(data.items || []);
        } catch (loadError) {
            setError(loadError.message);
        } finally {
            setLoading(false);
        }
    }, [state.user]);

    const loadPermissionMatrix = useCallback(async () => {
        if (!state.user) {
            return;
        }

        try {
            const data = await requestJson("/api/permissions");
            setRoles(data.roles || ROLE_DEFINITIONS);
            setRolePermissions(expandLegacyManagePermissions(data.rolePermissions || {}));
        } catch (loadError) {
            setError(loadError.message);
        }
    }, [state.user]);

    useEffect(() => {
        loadUsers();
        loadPermissionMatrix();
    }, [loadUsers, loadPermissionMatrix]);

    const onChangeUsername = (event) => {
        setForm((prev) => ({ ...prev, username: event.target.value }));
    };

    const onToggleFormRole = (roleName) => {
        setForm((prev) => {
            const nextRoles = toggleArrayValue(prev.roles, roleName);
            return { ...prev, roles: nextRoles.length > 0 ? nextRoles : [ROLES.staff] };
        });
    };

    const onCreateUser = async (event) => {
        event.preventDefault();

        if (!canAddUser) {
            setError("forbidden");
            return;
        }

        if (!form.username || form.roles.length === 0) {
            return;
        }

        try {
            setError("");
            setMessage("");
            await requestJson("/api/users", {
                method: "POST",
                body: JSON.stringify(form),
            });
            setForm(initialForm);
            setMessage("สร้างผู้ใช้ใหม่สำเร็จ (password เริ่มต้นคือ password)");
            await loadUsers();
        } catch (submitError) {
            setError(submitError.message);
        }
    };

    const onOpenEditRoles = (user) => {
        if (!canEditUser) {
            return;
        }

        setEditingRoleId(user.id);
        setEditingRoles(Array.isArray(user.roles) && user.roles.length > 0 ? user.roles : [user.role]);
    };

    const onToggleEditingRole = (roleName) => {
        setEditingRoles((prev) => {
            const next = toggleArrayValue(prev, roleName);
            return next.length > 0 ? next : prev;
        });
    };

    const onSaveRoles = async () => {
        if (!canEditUser) {
            setError("forbidden");
            return;
        }

        if (!editingRoleId || editingRoles.length === 0) {
            return;
        }

        try {
            setError("");
            setMessage("");
            await requestJson(`/api/users/${editingRoleId}`, {
                method: "PUT",
                body: JSON.stringify({ action: "set_roles", roles: editingRoles }),
            });
            setEditingRoleId("");
            setMessage("บันทึก roles สำเร็จ");
            await loadUsers();
        } catch (updateError) {
            setError(updateError.message);
        }
    };

    const onToggle = async (userId, currentActive) => {
        if (!canEditUser) {
            setError("forbidden");
            return;
        }

        const action = currentActive ? "ยืนยันการ Disable user นี้?" : "ยืนยันการ Enable user นี้?";
        if (!window.confirm(action)) {
            return;
        }

        try {
            setError("");
            setMessage("");
            await requestJson(`/api/users/${userId}`, {
                method: "PUT",
                body: JSON.stringify({ action: "toggle" }),
            });
            setMessage(currentActive ? "Disable user สำเร็จ" : "Enable user สำเร็จ");
            await loadUsers();
        } catch (toggleError) {
            setError(toggleError.message);
        }
    };

    const onResetPassword = async (userId, username) => {
        if (!canEditUser) {
            setError("forbidden");
            return;
        }

        if (!window.confirm(`Reset รหัสผ่านของ \"${username}\" เป็น \"password\"?`)) {
            return;
        }

        try {
            setError("");
            setMessage("");
            await requestJson(`/api/users/${userId}`, {
                method: "PUT",
                body: JSON.stringify({ action: "reset_password" }),
            });
            setMessage(`รีเซ็ตรหัสผ่านของ \"${username}\" สำเร็จ`);
        } catch (resetError) {
            setError(resetError.message);
        }
    };

    const onDeleteUser = async (userId, username) => {
        if (!canDeleteUser) {
            setError("forbidden");
            return;
        }

        if (!window.confirm(`ยืนยันการลบ user \"${username}\" แบบถาวร?`)) {
            return;
        }

        try {
            setError("");
            setMessage("");
            await requestJson(`/api/users/${userId}`, {
                method: "DELETE",
            });
            setMessage(`ลบ user \"${username}\" สำเร็จ`);
            await loadUsers();
        } catch (deleteError) {
            setError(deleteError.message);
        }
    };

    const isSelf = (userId) => state.user?.id === userId;

    const toggleMatrixPermission = (roleName, permissionKey) => {
        setRolePermissions((prev) => {
            const current = Array.isArray(prev[roleName]) ? prev[roleName] : [];
            const next = toggleArrayValue(current, permissionKey);
            return { ...prev, [roleName]: next };
        });
    };

    const onSavePermissionMatrix = async () => {
        if (!canEditUser) {
            setError("forbidden");
            return;
        }

        try {
            setSavingMatrix(true);
            setError("");
            setMessage("");
            await requestJson("/api/permissions", {
                method: "PUT",
                body: JSON.stringify({ rolePermissions }),
            });
            setMessage("บันทึก permission matrix สำเร็จ");
            await loadPermissionMatrix();
        } catch (saveError) {
            setError(saveError.message);
        } finally {
            setSavingMatrix(false);
        }
    };

    return (
        <RoleGate path="/users">
            <section className="stack">
                <h2>User Management</h2>

                {error ? <p className="notice error">{error}</p> : null}
                {message ? <p className="notice">{message}</p> : null}

                {canAddUser ? (
                    <form className="form-grid" onSubmit={onCreateUser}>
                        <label>
                            Username
                            <input
                                name="username"
                                value={form.username}
                                onChange={onChangeUsername}
                                placeholder="ชื่อผู้ใช้ใหม่"
                                required
                            />
                        </label>
                        <label>
                            Roles
                            <div className="inline-actions">
                                {roles.map((role) => (
                                    <label key={role.name}>
                                        <input
                                            type="checkbox"
                                            checked={form.roles.includes(role.name)}
                                            onChange={() => onToggleFormRole(role.name)}
                                        />
                                        {" "}
                                        {role.label}
                                    </label>
                                ))}
                            </div>
                        </label>
                        <button type="submit">Add User</button>
                    </form>
                ) : null}

                <section className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Roles</th>
                                <th>Status</th>
                                <th>Created At</th>
                                <th>Active Sessions</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6}>กำลังโหลดข้อมูล...</td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6}>ไม่พบผู้ใช้ในระบบ</td>
                                </tr>
                            ) : (
                                users.map((user) => {
                                    const userRoles = Array.isArray(user.roles) && user.roles.length > 0 ? user.roles : [user.role];

                                    return (
                                        <tr key={user.id}>
                                            <td>{user.username}</td>
                                            <td>
                                                {editingRoleId === user.id && !isSelf(user.id) ? (
                                                    <div className="inline-actions">
                                                        {roles.map((role) => (
                                                            <label key={role.name}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={editingRoles.includes(role.name)}
                                                                    onChange={() => onToggleEditingRole(role.name)}
                                                                />
                                                                {" "}
                                                                {role.label}
                                                            </label>
                                                        ))}
                                                        <button type="button" className="btn-secondary" onClick={onSaveRoles}>
                                                            Save Roles
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="btn-secondary"
                                                            onClick={() => setEditingRoleId("")}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span>{userRoles.map((roleName) => getRoleLabel(roleName)).join(", ")}</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className={user.isActive ? "badge-active" : "badge-disabled"}>
                                                    {user.isActive ? "Active" : "Disabled"}
                                                </span>
                                            </td>
                                            <td>{new Date(user.createdAt).toLocaleDateString("th-TH")}</td>
                                            <td>{user.activeSessions}</td>
                                            <td>
                                                <div className="inline-actions">
                                                    {!isSelf(user.id) && canEditUser ? (
                                                        <button type="button" className="btn-secondary" onClick={() => onOpenEditRoles(user)}>
                                                            Edit Roles
                                                        </button>
                                                    ) : null}
                                                    {canEditUser ? (
                                                        <button
                                                            type="button"
                                                            className="btn-secondary"
                                                            onClick={() => onResetPassword(user.id, user.username)}
                                                        >
                                                            Reset PW
                                                        </button>
                                                    ) : null}
                                                    {!isSelf(user.id) && canEditUser ? (
                                                        <button
                                                            type="button"
                                                            className={user.isActive ? "btn-danger" : "btn-secondary"}
                                                            onClick={() => onToggle(user.id, user.isActive)}
                                                        >
                                                            {user.isActive ? "Disable" : "Enable"}
                                                        </button>
                                                    ) : null}
                                                    {!isSelf(user.id) && canDeleteUser ? (
                                                        <button
                                                            type="button"
                                                            className="btn-danger"
                                                            onClick={() => onDeleteUser(user.id, user.username)}
                                                        >
                                                            Delete User
                                                        </button>
                                                    ) : null}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </section>

                <section className="stack">
                    <h3>Role-Permission Matrix (View/Add/Edit/Delete)</h3>
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Module</th>
                                    {configurableRoles.map((roleName) => (
                                        <th key={roleName}>{getRoleLabel(roleName)} (V/A/E/D)</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {MODULE_PERMISSION_MATRIX.map((moduleItem) => (
                                    <tr key={moduleItem.module}>
                                        <td>{moduleItem.module}</td>
                                        {configurableRoles.map((roleName) => (
                                            <td key={`${moduleItem.module}-${roleName}`}>
                                                <div className="inline-actions">
                                                    {moduleItem.actions.map((actionItem) => (
                                                        <label key={`${actionItem.key}-${roleName}`}>
                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    Array.isArray(rolePermissions[roleName])
                                                                    && rolePermissions[roleName].includes(actionItem.key)
                                                                }
                                                                onChange={() => toggleMatrixPermission(roleName, actionItem.key)}
                                                                disabled={!canEditUser}
                                                            />
                                                            {" "}
                                                            {actionItem.label}
                                                        </label>
                                                    ))}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="inline-actions">
                        <button type="button" onClick={onSavePermissionMatrix} disabled={savingMatrix || !canEditUser}>
                            {savingMatrix ? "Saving..." : "Save Permission Matrix"}
                        </button>
                    </div>
                </section>
            </section>
        </RoleGate>
    );
}
