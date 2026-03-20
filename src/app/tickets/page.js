"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import RoleGate from "@/components/RoleGate";
import StatusPill from "@/components/StatusPill";
import { useAppData } from "@/context/AppDataContext";
import { requestJson } from "@/lib/client-api";
import { downloadCsv } from "@/lib/csv";
import { hasPermission, PERMISSIONS } from "@/lib/roles";

const initialForm = {
    abilityId: "",
    title: "",
    target: "",
    assignToUserId: "",
    startDate: "",
    endDate: "",
};

export default function TicketManagementPage() {
    const { state } = useAppData();
    const canAddTicket = hasPermission(state.user, PERMISSIONS.ticketsAdd);
    const canEditTicket = hasPermission(state.user, PERMISSIONS.ticketsEdit);
    const canDeleteTicket = hasPermission(state.user, PERMISSIONS.ticketsDelete);
    const canViewActionPlans = hasPermission(state.user, PERMISSIONS.actionPlansView);
    const [form, setForm] = useState(initialForm);
    const [tickets, setTickets] = useState([]);
    const [abilities, setAbilities] = useState([]);
    const [users, setUsers] = useState([]);
    const [editingId, setEditingId] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [abilityFilter, setAbilityFilter] = useState("all");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const loadLookup = useCallback(async () => {
        if (!state.user) {
            return;
        }

        try {
            const data = await requestJson("/api/bootstrap");
            setAbilities(data.abilities || []);
            setUsers(data.users || []);
        } catch (loadError) {
            setError(loadError.message);
        }
    }, [state.user]);

    const loadTickets = useCallback(async () => {
        if (!state.user) {
            return;
        }

        setLoading(true);
        try {
            setError("");
            const params = new URLSearchParams({
                search,
                status: statusFilter,
                abilityId: abilityFilter,
            });
            const data = await requestJson(`/api/tickets?${params.toString()}`);
            setTickets(data.items || []);
        } catch (loadError) {
            setError(loadError.message);
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter, abilityFilter, state.user]);

    useEffect(() => {
        loadLookup();
    }, [loadLookup]);

    useEffect(() => {
        loadTickets();
    }, [loadTickets]);

    const onChange = (event) => {
        setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    };

    const resetForm = () => {
        setForm(initialForm);
        setEditingId("");
    };

    const onSubmit = async (event) => {
        event.preventDefault();

        if (editingId && !canEditTicket) {
            setError("forbidden");
            return;
        }

        if (!editingId && !canAddTicket) {
            setError("forbidden");
            return;
        }

        if (
            !form.abilityId ||
            !form.title ||
            !form.target ||
            !form.assignToUserId ||
            !form.startDate ||
            !form.endDate
        ) {
            return;
        }

        try {
            setError("");
            if (editingId) {
                await requestJson(`/api/tickets/${editingId}`, {
                    method: "PUT",
                    body: JSON.stringify(form),
                });
            } else {
                await requestJson("/api/tickets", {
                    method: "POST",
                    body: JSON.stringify(form),
                });
            }

            resetForm();
            loadTickets();
            loadLookup();
        } catch (submitError) {
            setError(submitError.message);
        }
    };

    const onEdit = (ticket) => {
        if (!canEditTicket) {
            return;
        }

        setEditingId(ticket.id);
        setForm({
            abilityId: ticket.abilityId,
            title: ticket.title,
            target: ticket.target,
            assignToUserId: ticket.assignToUserId || "",
            startDate: ticket.startDate,
            endDate: ticket.endDate,
        });
    };

    const onDelete = async (id) => {
        if (!canDeleteTicket) {
            setError("forbidden");
            return;
        }

        try {
            setError("");
            await requestJson(`/api/tickets/${id}`, { method: "DELETE" });
            if (editingId === id) {
                resetForm();
            }
            loadTickets();
            loadLookup();
        } catch (deleteError) {
            setError(deleteError.message);
        }
    };

    const onExport = () => {
        const rows = tickets.map((item) => ({
            ability: item.abilityName,
            ticket: item.title,
            target: item.target,
            response_person: item.responsePerson,
            start_date: item.startDate,
            end_date: item.endDate,
            duration_days: item.durationDays,
            status: item.status,
        }));
        downloadCsv("tickets.csv", rows);
    };

    return (
        <RoleGate path="/tickets">
            <section className="stack">
                <h2>Ticket Management</h2>

                {error ? <p className="notice error">{error}</p> : null}

                {canAddTicket || canEditTicket ? (
                    <form className="form-grid" onSubmit={onSubmit}>
                        <label>
                            Ability
                            <select name="abilityId" value={form.abilityId} onChange={onChange} required>
                                <option value="">Select ability</option>
                                {abilities.map((ability) => (
                                    <option key={ability.id} value={ability.id}>
                                        {ability.name} ({ability.target})
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Implement Ticket
                            <input name="title" value={form.title} onChange={onChange} required />
                        </label>
                        <label>
                            Ticket Target
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
                        <button type="submit" disabled={abilities.length === 0}>
                            {editingId ? "Update Ticket" : "Add Ticket"}
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
                            placeholder="ticket / target / response person"
                        />
                    </label>
                    <label>
                        Ability Filter
                        <select value={abilityFilter} onChange={(event) => setAbilityFilter(event.target.value)}>
                            <option value="all">All Abilities</option>
                            {abilities.map((ability) => (
                                <option key={ability.id} value={ability.id}>
                                    {ability.name}
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
                                <th>Ability</th>
                                <th>Ticket</th>
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
                            ) : tickets.length === 0 ? (
                                <tr>
                                    <td colSpan={9}>ยังไม่มี Ticket</td>
                                </tr>
                            ) : (
                                tickets.map((ticket) => (
                                    <tr key={ticket.id}>
                                        <td>{ticket.abilityName || "-"}</td>
                                        <td>{ticket.title}</td>
                                        <td>{ticket.target}</td>
                                        <td>{ticket.durationDays} days</td>
                                        <td>{ticket.startDate}</td>
                                        <td>{ticket.endDate}</td>
                                        <td>
                                            <StatusPill status={ticket.status} />
                                        </td>
                                        <td>{ticket.responsePerson}</td>
                                        <td>
                                            <div className="inline-actions">
                                                {canViewActionPlans ? (
                                                    <Link
                                                        href={`/action-plan?ticketId=${ticket.id}`}
                                                        className="btn-secondary"
                                                    >
                                                        Edit Action
                                                    </Link>
                                                ) : null}
                                                {canEditTicket ? (
                                                    <button type="button" className="btn-secondary" onClick={() => onEdit(ticket)}>
                                                        Edit
                                                    </button>
                                                ) : null}
                                                {canDeleteTicket ? (
                                                    <button type="button" className="btn-danger" onClick={() => onDelete(ticket.id)}>
                                                        Delete
                                                    </button>
                                                ) : null}
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
