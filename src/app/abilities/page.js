"use client";

import { useCallback, useEffect, useState } from "react";
import RoleGate from "@/components/RoleGate";
import StatusPill from "@/components/StatusPill";
import { useAppData } from "@/context/AppDataContext";
import { requestJson } from "@/lib/client-api";
import { downloadCsv } from "@/lib/csv";
import { hasPermission, PERMISSIONS } from "@/lib/roles";

const initialForm = {
    projectId: "",
    name: "",
    target: "",
    assignToUserId: "",
    startDate: "",
    endDate: "",
};

export default function AbilityManagementPage() {
    const { state } = useAppData();
    const canAddAbility = hasPermission(state.user, PERMISSIONS.abilitiesAdd);
    const canEditAbility = hasPermission(state.user, PERMISSIONS.abilitiesEdit);
    const canDeleteAbility = hasPermission(state.user, PERMISSIONS.abilitiesDelete);
    const canEditTicket = hasPermission(state.user, PERMISSIONS.ticketsEdit);
    const [form, setForm] = useState(initialForm);
    const [abilities, setAbilities] = useState([]);
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [editingId, setEditingId] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [projectFilter, setProjectFilter] = useState("all");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedAbility, setSelectedAbility] = useState(null);
    const [abilityFiles, setAbilityFiles] = useState([]);
    const [loadingFiles, setLoadingFiles] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);

    const loadLookup = useCallback(async () => {
        if (!state.user) {
            return;
        }

        try {
            const data = await requestJson("/api/bootstrap");
            setProjects(data.projects || []);
            setUsers(data.users || []);
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

    const loadFiles = useCallback(async (abilityId) => {
        setLoadingFiles(true);
        try {
            setError("");
            const data = await requestJson(`/api/abilities/${abilityId}/files`);
            setAbilityFiles(data.items || []);
        } catch (loadError) {
            setError(loadError.message);
            setAbilityFiles([]);
        } finally {
            setLoadingFiles(false);
        }
    }, []);

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

        if (editingId && !canEditAbility) {
            setError("forbidden");
            return;
        }

        if (!editingId && !canAddAbility) {
            setError("forbidden");
            return;
        }

        if (!form.name || !form.target || !form.assignToUserId || !form.startDate || !form.endDate) {
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
        if (!canEditAbility) {
            return;
        }

        setEditingId(ability.id);
        setForm({
            projectId: ability.projectId || "",
            name: ability.name,
            target: ability.target,
            assignToUserId: ability.assignToUserId || "",
            startDate: ability.startDate,
            endDate: ability.endDate,
        });
    };

    const onDelete = async (id) => {
        if (!canDeleteAbility) {
            setError("forbidden");
            return;
        }

        try {
            setError("");
            await requestJson(`/api/abilities/${id}`, { method: "DELETE" });
            if (editingId === id) {
                resetForm();
            }
            if (selectedAbility?.id === id) {
                setSelectedAbility(null);
                setAbilityFiles([]);
            }
            loadAbilities();
            loadLookup();
        } catch (deleteError) {
            setError(deleteError.message);
        }
    };

    const onExport = () => {
        const rows = abilities.map((item) => ({
            project: item.projectName || "No Project",
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

    const openFilePanel = async (ability) => {
        setSelectedAbility(ability);
        setUploadFile(null);
        await loadFiles(ability.id);
    };

    const onDeleteFile = async (fileId) => {
        if (!canEditAbility) {
            setError("forbidden");
            return;
        }

        try {
            setError("");
            await requestJson(`/api/files/${fileId}`, { method: "DELETE" });
            await loadFiles(selectedAbility.id);
        } catch (deleteFileError) {
            setError(deleteFileError.message);
        }
    };

    const onUploadAbilityFile = async () => {
        if (!canEditAbility) {
            setError("forbidden");
            return;
        }

        if (!selectedAbility || !uploadFile) {
            return;
        }

        const formData = new FormData();
        formData.append("file", uploadFile);

        try {
            setError("");
            await requestJson(`/api/abilities/${selectedAbility.id}/files`, {
                method: "POST",
                body: formData,
            });
            setUploadFile(null);
            await loadFiles(selectedAbility.id);
        } catch (uploadError) {
            setError(uploadError.message);
        }
    };

    return (
        <RoleGate path="/abilities">
            <section className="stack">
                <h2>Ability Management</h2>

                {error ? <p className="notice error">{error}</p> : null}

                {canAddAbility || canEditAbility ? (
                    <form className="form-grid" onSubmit={onSubmit}>
                        <label>
                            Project
                            <select name="projectId" value={form.projectId} onChange={onChange}>
                                <option value="">- No Project -</option>
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
                        <button type="submit">{editingId ? "Update Ability" : "Add Ability"}</button>
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
                            placeholder="ability / target / response person"
                        />
                    </label>
                    <label>
                        Project Filter
                        <select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)}>
                            <option value="all">All Projects</option>
                            <option value="no-project">No Project</option>
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

                {selectedAbility ? (
                    <section className="stack">
                        <h3>Result Files: {selectedAbility.name}</h3>
                        <div className="toolbar">
                            <label>
                                Upload Result File (CSV / XLSX / Image {"<="} 10MB)
                                <input
                                    type="file"
                                    accept=".csv,.xlsx,.jpg,.jpeg,.png,.gif,.webp,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,image/*"
                                    onChange={(event) =>
                                        setUploadFile(event.target.files && event.target.files[0] ? event.target.files[0] : null)
                                    }
                                />
                            </label>
                            <button type="button" onClick={onUploadAbilityFile} disabled={!uploadFile || !canEditAbility}>
                                Upload Result File
                            </button>
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => loadFiles(selectedAbility.id)}
                            >
                                Refresh List
                            </button>
                            <button type="button" className="btn-secondary" onClick={() => setSelectedAbility(null)}>
                                Close
                            </button>
                        </div>
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Source</th>
                                        <th>Ticket</th>
                                        <th>File Name</th>
                                        <th>Size (bytes)</th>
                                        <th>Uploaded At</th>
                                        {canEditAbility || canEditTicket ? <th>Actions</th> : null}
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingFiles ? (
                                        <tr>
                                            <td colSpan={canEditAbility || canEditTicket ? 6 : 5}>กำลังโหลดรายการไฟล์...</td>
                                        </tr>
                                    ) : abilityFiles.length === 0 ? (
                                        <tr>
                                            <td colSpan={canEditAbility || canEditTicket ? 6 : 5}>ยังไม่มีไฟล์</td>
                                        </tr>
                                    ) : (
                                        abilityFiles.map((file) => (
                                            <tr key={file.id}>
                                                <td>{file.sourceType === "ticket" ? "Ticket" : "Ability"}</td>
                                                <td>{file.ticketTitle || "-"}</td>
                                                <td>
                                                    <a href={file.downloadUrl}>{file.originalName}</a>
                                                </td>
                                                <td>{file.sizeBytes}</td>
                                                <td>{new Date(file.createdAt).toLocaleString("th-TH")}</td>
                                                {canEditAbility || canEditTicket ? (
                                                    <td>
                                                        {(file.sourceType === "ticket" ? canEditTicket : canEditAbility) ? (
                                                            <button
                                                                type="button"
                                                                className="btn-danger"
                                                                onClick={() => onDeleteFile(file.id)}
                                                            >
                                                                Delete
                                                            </button>
                                                        ) : null}
                                                    </td>
                                                ) : null}
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
                                                {canEditAbility ? (
                                                    <button type="button" className="btn-secondary" onClick={() => onEdit(ability)}>
                                                        Edit
                                                    </button>
                                                ) : null}
                                                {canDeleteAbility ? (
                                                    <button type="button" className="btn-danger" onClick={() => onDelete(ability.id)}>
                                                        Delete
                                                    </button>
                                                ) : null}
                                                <button type="button" className="btn-secondary" onClick={() => openFilePanel(ability)}>
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
