"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import RoleGate from "@/components/RoleGate";
import { useAppData } from "@/context/AppDataContext";
import { requestJson } from "@/lib/client-api";
import { downloadCsv } from "@/lib/csv";

const initialForm = {
    name: "",
    target: "",
    currentTarget: "",
    expect: "",
};

export default function GoalManagementPage() {
    const { state } = useAppData();
    const [form, setForm] = useState(initialForm);
    const [goals, setGoals] = useState([]);
    const [search, setSearch] = useState("");
    const [currentTargetFilter, setCurrentTargetFilter] = useState("all");
    const [editingId, setEditingId] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const loadGoals = useCallback(async () => {
        if (!state.user) {
            return;
        }

        setLoading(true);
        try {
            setError("");
            const params = new URLSearchParams({
                search,
                currentTarget: currentTargetFilter,
            });
            const data = await requestJson(`/api/goals?${params.toString()}`);
            setGoals(data.items || []);
        } catch (loadError) {
            setError(loadError.message);
        } finally {
            setLoading(false);
        }
    }, [search, currentTargetFilter, state.user]);

    useEffect(() => {
        loadGoals();
    }, [loadGoals]);

    const tableRows = useMemo(() => goals, [goals]);

    const onChange = (event) => {
        setForm((prev) => ({
            ...prev,
            [event.target.name]: event.target.value,
        }));
    };

    const resetForm = () => {
        setForm(initialForm);
        setEditingId("");
    };

    const onSubmit = async (event) => {
        event.preventDefault();

        if (!form.name || !form.target) {
            return;
        }

        try {
            setError("");

            if (editingId) {
                await requestJson(`/api/goals/${editingId}`, {
                    method: "PUT",
                    body: JSON.stringify(form),
                });
            } else {
                await requestJson("/api/goals", {
                    method: "POST",
                    body: JSON.stringify(form),
                });
            }

            resetForm();
            loadGoals();
        } catch (submitError) {
            setError(submitError.message);
        }
    };

    const onEdit = (goal) => {
        setEditingId(goal.id);
        setForm({
            name: goal.name,
            target: goal.target,
            currentTarget: goal.currentTarget,
            expect: goal.expect,
        });
    };

    const onDelete = async (id) => {
        try {
            setError("");
            await requestJson(`/api/goals/${id}`, { method: "DELETE" });
            if (editingId === id) {
                resetForm();
            }
            loadGoals();
        } catch (deleteError) {
            setError(deleteError.message);
        }
    };

    const onExport = () => {
        const exportRows = tableRows.map((goal) => ({
            goal: goal.name,
            target: goal.target,
            current_target: goal.currentTarget,
            expect: goal.expect,
        }));
        downloadCsv("goals.csv", exportRows);
    };

    return (
        <RoleGate path="/goals">
            <section className="stack">
                <h2>Goal Management</h2>

                {error ? <p className="notice error">{error}</p> : null}

                <form className="form-grid" onSubmit={onSubmit}>
                    <label>
                        Goal Name
                        <input name="name" value={form.name} onChange={onChange} required />
                    </label>
                    <label>
                        Target
                        <input name="target" value={form.target} onChange={onChange} required />
                    </label>
                    <label>
                        Current Target
                        <input name="currentTarget" value={form.currentTarget} onChange={onChange} />
                    </label>
                    <label>
                        Expect
                        <textarea name="expect" value={form.expect} onChange={onChange} rows={3} />
                    </label>
                    <button type="submit">{editingId ? "Update Goal" : "Add Goal"}</button>
                    {editingId ? (
                        <button type="button" className="btn-secondary" onClick={resetForm}>
                            Cancel Edit
                        </button>
                    ) : null}
                </form>

                <section className="toolbar">
                    <label>
                        Search
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="goal / target / expect"
                        />
                    </label>
                    <label>
                        Current Target Filter
                        <select value={currentTargetFilter} onChange={(event) => setCurrentTargetFilter(event.target.value)}>
                            <option value="all">All</option>
                            <option value="with">Has Current Target</option>
                            <option value="without">No Current Target</option>
                        </select>
                    </label>
                    <button type="button" className="btn-secondary" onClick={onExport}>
                        Export CSV
                    </button>
                </section>

                <section className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Goal</th>
                                <th>Target</th>
                                <th>Current Target</th>
                                <th>Expect</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5}>กำลังโหลดข้อมูล...</td>
                                </tr>
                            ) : tableRows.length === 0 ? (
                                <tr>
                                    <td colSpan={5}>ยังไม่มี Goal</td>
                                </tr>
                            ) : (
                                tableRows.map((goal) => (
                                    <tr key={goal.id}>
                                        <td>{goal.name}</td>
                                        <td>{goal.target}</td>
                                        <td>{goal.currentTarget || "-"}</td>
                                        <td>{goal.expect || "-"}</td>
                                        <td>
                                            <div className="inline-actions">
                                                <button type="button" className="btn-secondary" onClick={() => onEdit(goal)}>
                                                    Edit
                                                </button>
                                                <button type="button" className="btn-danger" onClick={() => onDelete(goal.id)}>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </section>
            </section>
        </RoleGate>
    );
}
