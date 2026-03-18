"use client";

import { useCallback, useEffect, useState } from "react";
import RoleGate from "@/components/RoleGate";
import StatusPill from "@/components/StatusPill";
import { useAppData } from "@/context/AppDataContext";
import { requestJson } from "@/lib/client-api";
import { downloadCsv } from "@/lib/csv";

const initialForm = {
    projectId: "",
    name: "",
    target: "",
    responsePerson: "",
    startDate: "",
    endDate: "",
};

export default function AbilityManagementPage() {
    const { state } = useAppData();
    const [form, setForm] = useState(initialForm);
    const [abilities, setAbilities] = useState([]);
    const [projects, setProjects] = useState([]);
    const [editingId, setEditingId] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [projectFilter, setProjectFilter] = useState("all");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const loadLookup = useCallback(async () => {
        if (!state.user) {
            return;
        }

        try {
            const data = await requestJson("/api/bootstrap");
            setProjects(data.projects || []);
        } catch (loadError) {
            setError(loadError.message);
        }
    }, [state.user]);

    const loadAbilities = useCallback(async () => {
        if (!state.user) {
            return;
        }

        setLoading(true);
        try {
            setError("");
            const params = new URLSearchParams({
                search,
                status: statusFilter,
                projectId: projectFilter,
            });
            const data = await requestJson(`/api/abilities?${params.toString()}`);
            setAbilities(data.items || []);
        } catch (loadError) {
            setError(loadError.message);
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter, projectFilter, state.user]);

    useEffect(() => {
        loadLookup();
    }, [loadLookup]);

    useEffect(() => {
        loadAbilities();
    }, [loadAbilities]);

    const onChange = (event) => {
        setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    };

    const resetForm = () => {
        setForm(initialForm);
        setEditingId("");
    };

    const onSubmit = async (event) => {
        event.preventDefault();

        if (
            !form.projectId ||
            !form.name ||
            !form.target ||
            !form.responsePerson ||
            !form.startDate ||
            !form.endDate
        ) {
            return;
        }

        try {
            setError("");
            if (editingId) {
                await requestJson(`/api/abilities/${editingId}`, {
                    method: "PUT",
                    body: JSON.stringify(form),
                });
            } else {
                await requestJson("/api/abilities", {
                    method: "POST",
                    body: JSON.stringify(form),
                });
            }

            resetForm();
            loadAbilities();
            loadLookup();
        } catch (submitError) {
            setError(submitError.message);
        }
    };

    const onEdit = (ability) => {
        setEditingId(ability.id);
        setForm({
            projectId: ability.projectId,
            name: ability.name,
            target: ability.target,
            responsePerson: ability.responsePerson,
            startDate: ability.startDate,
            endDate: ability.endDate,
        });
    };

    const onDelete = async (id) => {
        try {
            setError("");
            await requestJson(`/api/abilities/${id}`, { method: "DELETE" });
            if (editingId === id) {
                resetForm();
            }
            loadAbilities();
            loadLookup();
        } catch (deleteError) {
            setError(deleteError.message);
        }
    };

    const onExport = () => {
        const rows = abilities.map((item) => ({
            project: item.projectName,
            ability: item.name,
            target: item.target,
            response_person: item.responsePerson,
            start_date: item.startDate,
            end_date: item.endDate,
            duration_days: item.durationDays,
            status: item.status,
        }));
        downloadCsv("abilities.csv", rows);
    };

    return (
        <RoleGate path="/abilities">
            <section className="stack">
                <h2>Ability Management</h2>

                {error ? <p className="notice error">{error}</p> : null}

                <form className="form-grid" onSubmit={onSubmit}>
                    <label>
                        Project
                        <select name="projectId" value={form.projectId} onChange={onChange} required>
                            <option value="">Select project</option>
                            {projects.map((project) => (
                                <option key={project.id} value={project.id}>
                                    {project.name} ({project.target})
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Ability Name
                        <input name="name" value={form.name} onChange={onChange} required />
                    </label>
                    <label>
                        Ability Target
                        <input name="target" value={form.target} onChange={onChange} required />
                    </label>
                    <label>
                        Response Person
                        <input name="responsePerson" value={form.responsePerson} onChange={onChange} required />
                    </label>
                    <label>
                        Start Date
                        <input type="date" name="startDate" value={form.startDate} onChange={onChange} required />
                    </label>
                    <label>
                        End Date
                        <input type="date" name="endDate" value={form.endDate} onChange={onChange} required />
                    </label>
                    <button type="submit" disabled={projects.length === 0}>
                        {editingId ? "Update Ability" : "Add Ability"}
                    </button>
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
                            placeholder="ability / target / response person"
                        />
                    </label>
                    <label>
                        Project Filter
                        <select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)}>
                            <option value="all">All Projects</option>
                            {projects.map((project) => (
                                <option key={project.id} value={project.id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Status Filter
                        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                            <option value="all">All</option>
                            <option value="in-time">In Time</option>
                            <option value="delay">Delay</option>
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
                                <th>Project</th>
                                <th>Ability</th>
                                <th>Target</th>
                                <th>Duration</th>
                                <th>Start</th>
                                <th>End</th>
                                <th>Status</th>
                                <th>Response Person</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={9}>กำลังโหลดข้อมูล...</td>
                                </tr>
                            ) : abilities.length === 0 ? (
                                <tr>
                                    <td colSpan={9}>ยังไม่มี Ability</td>
                                </tr>
                            ) : (
                                abilities.map((ability) => (
                                    <tr key={ability.id}>
                                        <td>{ability.projectName || "-"}</td>
                                        <td>{ability.name}</td>
                                        <td>{ability.target}</td>
                                        <td>{ability.durationDays} days</td>
                                        <td>{ability.startDate}</td>
                                        <td>{ability.endDate}</td>
                                        <td>
                                            <StatusPill status={ability.status} />
                                        </td>
                                        <td>{ability.responsePerson}</td>
                                        <td>
                                            <div className="inline-actions">
                                                <button type="button" className="btn-secondary" onClick={() => onEdit(ability)}>
                                                    Edit
                                                </button>
                                                <button type="button" className="btn-danger" onClick={() => onDelete(ability.id)}>
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
