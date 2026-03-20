"use client";

import { useCallback, useEffect, useState } from "react";
import RoleGate from "@/components/RoleGate";
import StatusPill from "@/components/StatusPill";
import { useAppData } from "@/context/AppDataContext";
import { requestJson } from "@/lib/client-api";
import { downloadCsv } from "@/lib/csv";
import { hasPermission, PERMISSIONS } from "@/lib/roles";

const initialForm = {
    goalId: "",
    name: "",
    target: "",
    assignToUserId: "",
    startDate: "",
    endDate: "",
};

export default function ProjectManagementPage() {
    const { state } = useAppData();
    const canAddProject = hasPermission(state.user, PERMISSIONS.projectsAdd);
    const canEditProject = hasPermission(state.user, PERMISSIONS.projectsEdit);
    const canDeleteProject = hasPermission(state.user, PERMISSIONS.projectsDelete);
    const [form, setForm] = useState(initialForm);
    const [projects, setProjects] = useState([]);
    const [goals, setGoals] = useState([]);
    const [users, setUsers] = useState([]);
    const [editingId, setEditingId] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [goalFilter, setGoalFilter] = useState("all");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [projectFiles, setProjectFiles] = useState([]);
    const [loadingFiles, setLoadingFiles] = useState(false);

    const loadLookup = useCallback(async () => {
        if (!state.user) {
            return;
        }

        try {
            const data = await requestJson("/api/bootstrap");
            setGoals(data.goals || []);
            setUsers(data.users || []);
        } catch (loadError) {
            setError(loadError.message);
        }
    }, [state.user]);

    const loadProjects = useCallback(async () => {
        if (!state.user) {
            return;
        }

        setLoading(true);
        try {
            setError("");
            const params = new URLSearchParams({
                search,
                status: statusFilter,
                goalId: goalFilter,
            });
            const data = await requestJson(`/api/projects?${params.toString()}`);
            setProjects(data.items || []);
        } catch (loadError) {
            setError(loadError.message);
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter, goalFilter, state.user]);

    const loadProjectFiles = useCallback(async (projectId) => {
        setLoadingFiles(true);
        try {
            setError("");
            const data = await requestJson(`/api/projects/${projectId}/files`);
            setProjectFiles(data.items || []);
        } catch (loadError) {
            setError(loadError.message);
            setProjectFiles([]);
        } finally {
            setLoadingFiles(false);
        }
    }, []);

    useEffect(() => {
        loadLookup();
    }, [loadLookup]);

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    const onChange = (event) => {
        setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    };

    const resetForm = () => {
        setForm(initialForm);
        setEditingId("");
    };

    const onSubmit = async (event) => {
        event.preventDefault();

        if (editingId && !canEditProject) {
            setError("forbidden");
            return;
        }

        if (!editingId && !canAddProject) {
            setError("forbidden");
            return;
        }

        if (!form.goalId || !form.name || !form.target || !form.assignToUserId || !form.startDate || !form.endDate) {
            return;
        }

        try {
            setError("");
            if (editingId) {
                await requestJson(`/api/projects/${editingId}`, {
                    method: "PUT",
                    body: JSON.stringify(form),
                });
            } else {
                await requestJson("/api/projects", {
                    method: "POST",
                    body: JSON.stringify(form),
                });
            }

            resetForm();
            loadProjects();
            loadLookup();
        } catch (submitError) {
            setError(submitError.message);
        }
    };

    const onEdit = (project) => {
        if (!canEditProject) {
            return;
        }

        setEditingId(project.id);
        setForm({
            goalId: project.goalId,
            name: project.name,
            target: project.target,
            assignToUserId: project.assignToUserId || "",
            startDate: project.startDate,
            endDate: project.endDate,
        });
    };

    const onDelete = async (id) => {
        if (!canDeleteProject) {
            setError("forbidden");
            return;
        }

        try {
            setError("");
            await requestJson(`/api/projects/${id}`, { method: "DELETE" });
            if (editingId === id) {
                resetForm();
            }
            if (selectedProject?.id === id) {
                setSelectedProject(null);
                setProjectFiles([]);
            }
            loadProjects();
            loadLookup();
        } catch (deleteError) {
            setError(deleteError.message);
        }
    };

    const onExport = () => {
        const rows = projects.map((item) => ({
            goal: item.goalName,
            project: item.name,
            target: item.target,
            response_person: item.responsePerson,
            start_date: item.startDate,
            end_date: item.endDate,
            duration_days: item.durationDays,
            status: item.status,
        }));
        downloadCsv("projects.csv", rows);
    };

    const openFilePanel = async (project) => {
        setSelectedProject(project);
        await loadProjectFiles(project.id);
    };

    return (
        <RoleGate path="/projects">
            <section className="stack">
                <h2>Project Management</h2>

                {error ? <p className="notice error">{error}</p> : null}

                {canAddProject || canEditProject ? (
                    <form className="form-grid" onSubmit={onSubmit}>
                        <label>
                            Goal
                            <select name="goalId" value={form.goalId} onChange={onChange} required>
                                <option value="">Select goal</option>
                                {goals.map((goal) => (
                                    <option key={goal.id} value={goal.id}>
                                        {goal.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Project Name
                            <input name="name" value={form.name} onChange={onChange} required />
                        </label>
                        <label>
                            Project Target
                            <input name="target" value={form.target} onChange={onChange} required />
                        </label>
                        <label>
                            Assign To (Response Person)
                            <select name="assignToUserId" value={form.assignToUserId} onChange={onChange} required>
                                <option value="">Select user</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.username} ({user.role})
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Start Date
                            <input type="date" name="startDate" value={form.startDate} onChange={onChange} required />
                        </label>
                        <label>
                            End Date
                            <input type="date" name="endDate" value={form.endDate} onChange={onChange} required />
                        </label>
                        <button type="submit" disabled={goals.length === 0}>
                            {editingId ? "Update Project" : "Add Project"}
                        </button>
                        {editingId ? (
                            <button type="button" className="btn-secondary" onClick={resetForm}>
                                Cancel Edit
                            </button>
                        ) : null}
                    </form>
                ) : null}

                <section className="toolbar">
                    <label>
                        Search
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="project / target / response person"
                        />
                    </label>
                    <label>
                        Goal Filter
                        <select value={goalFilter} onChange={(event) => setGoalFilter(event.target.value)}>
                            <option value="all">All Goals</option>
                            {goals.map((goal) => (
                                <option key={goal.id} value={goal.id}>
                                    {goal.name}
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

                {selectedProject ? (
                    <section className="stack">
                        <h3>Project Files: {selectedProject.name}</h3>
                        <div className="toolbar">
                            <button type="button" className="btn-secondary" onClick={() => loadProjectFiles(selectedProject.id)}>
                                Refresh List Files
                            </button>
                            <button type="button" className="btn-secondary" onClick={() => setSelectedProject(null)}>
                                Close
                            </button>
                        </div>
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Ability</th>
                                        <th>File Name</th>
                                        <th>Size (bytes)</th>
                                        <th>Uploaded At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingFiles ? (
                                        <tr>
                                            <td colSpan={4}>กำลังโหลดรายการไฟล์...</td>
                                        </tr>
                                    ) : projectFiles.length === 0 ? (
                                        <tr>
                                            <td colSpan={4}>ยังไม่มีไฟล์ที่เกี่ยวข้องกับโปรเจกต์นี้</td>
                                        </tr>
                                    ) : (
                                        projectFiles.map((file) => (
                                            <tr key={file.id}>
                                                <td>{file.abilityName || "-"}</td>
                                                <td>
                                                    <a href={file.downloadUrl}>{file.originalName}</a>
                                                </td>
                                                <td>{file.sizeBytes}</td>
                                                <td>{new Date(file.createdAt).toLocaleString("th-TH")}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                ) : null}

                <section className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Goal</th>
                                <th>Project</th>
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
                            ) : projects.length === 0 ? (
                                <tr>
                                    <td colSpan={9}>ยังไม่มี Project</td>
                                </tr>
                            ) : (
                                projects.map((project) => (
                                    <tr key={project.id}>
                                        <td>{project.goalName || "-"}</td>
                                        <td>{project.name}</td>
                                        <td>{project.target}</td>
                                        <td>{project.durationDays} days</td>
                                        <td>{project.startDate}</td>
                                        <td>{project.endDate}</td>
                                        <td>
                                            <StatusPill status={project.status} />
                                        </td>
                                        <td>{project.responsePerson}</td>
                                        <td>
                                            <div className="inline-actions">
                                                {canEditProject ? (
                                                    <button type="button" className="btn-secondary" onClick={() => onEdit(project)}>
                                                        Edit
                                                    </button>
                                                ) : null}
                                                {canDeleteProject ? (
                                                    <button type="button" className="btn-danger" onClick={() => onDelete(project.id)}>
                                                        Delete
                                                    </button>
                                                ) : null}
                                                <button type="button" className="btn-secondary" onClick={() => openFilePanel(project)}>
                                                    List Files
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
