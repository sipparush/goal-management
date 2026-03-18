"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import RoleGate from "@/components/RoleGate";
import { requestJson } from "@/lib/client-api";

const initialForm = {
    action: "",
    status: "Pending",
    duration: "0",
    start: "",
    end: "",
    remark: "",
};

function toDateTimeInputValue(value) {
    if (!value) {
        return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const pad = (number) => String(number).padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function ActionPlanPage() {
    const searchParams = useSearchParams();
    const ticketId = searchParams.get("ticketId") || "";

    const [tickets, setTickets] = useState([]);
    const [rows, setRows] = useState([]);
    const [selectedTicketId, setSelectedTicketId] = useState(ticketId);
    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loadingTickets, setLoadingTickets] = useState(false);
    const [loadingRows, setLoadingRows] = useState(false);

    useEffect(() => {
        setSelectedTicketId(ticketId);
    }, [ticketId]);

    useEffect(() => {
        async function loadTicketLookup() {
            setLoadingTickets(true);
            try {
                setError("");
                const params = new URLSearchParams({
                    search: "",
                    status: "all",
                    abilityId: "all",
                });
                const data = await requestJson(`/api/tickets?${params.toString()}`);
                setTickets(data.items || []);
            } catch (loadError) {
                setError(loadError.message);
            } finally {
                setLoadingTickets(false);
            }
        }

        loadTicketLookup();
    }, []);

    useEffect(() => {
        async function loadRows() {
            if (!selectedTicketId) {
                setRows([]);
                return;
            }

            setLoadingRows(true);
            try {
                setError("");
                const params = new URLSearchParams({ ticketId: selectedTicketId });
                const data = await requestJson(`/api/action-plans?${params.toString()}`);
                setRows(data.items || []);
            } catch (loadError) {
                setError(loadError.message);
            } finally {
                setLoadingRows(false);
            }
        }

        loadRows();
        setForm(initialForm);
        setEditingId("");
        setMessage("");
    }, [selectedTicketId]);

    const selectedTicket = useMemo(
        () => tickets.find((ticket) => ticket.id === selectedTicketId) || null,
        [tickets, selectedTicketId],
    );

    const onChangeForm = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setForm(initialForm);
        setEditingId("");
    };

    const onSubmit = async (event) => {
        event.preventDefault();

        if (!selectedTicketId) {
            setError("กรุณาเลือก Ticket ก่อนบันทึก Action Plan");
            return;
        }

        if (!form.action.trim() || !form.status.trim()) {
            setError("กรุณาระบุ Action และ Status");
            return;
        }

        try {
            setError("");
            setMessage("");

            const payload = {
                ticketId: selectedTicketId,
                action: form.action,
                status: form.status,
                duration: form.duration,
                start: form.start || null,
                end: form.end || null,
                remark: form.remark,
            };

            if (editingId) {
                await requestJson(`/api/action-plans/${editingId}`, {
                    method: "PUT",
                    body: JSON.stringify(payload),
                });
                setMessage("อัปเดตแถว Action Plan แล้ว");
            } else {
                await requestJson("/api/action-plans", {
                    method: "POST",
                    body: JSON.stringify(payload),
                });
                setMessage("เพิ่มแถว Action Plan แล้ว");
            }

            const params = new URLSearchParams({ ticketId: selectedTicketId });
            const data = await requestJson(`/api/action-plans?${params.toString()}`);
            setRows(data.items || []);
            resetForm();
        } catch (submitError) {
            setError(submitError.message);
        }
    };

    const onEdit = (row) => {
        setEditingId(row.id);
        setForm({
            action: row.action,
            status: row.status,
            duration: String(row.duration ?? 0),
            start: toDateTimeInputValue(row.start),
            end: toDateTimeInputValue(row.end),
            remark: row.remark || "",
        });
    };

    const onDelete = async (rowId) => {
        const confirmed = window.confirm("ยืนยันการลบข้อมูลแถวนี้?");
        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setMessage("");

            await requestJson(`/api/action-plans/${rowId}`, { method: "DELETE" });

            const params = new URLSearchParams({ ticketId: selectedTicketId });
            const data = await requestJson(`/api/action-plans?${params.toString()}`);
            setRows(data.items || []);

            if (editingId === rowId) {
                resetForm();
            }

            setMessage("ลบแถว Action Plan แล้ว");
        } catch (deleteError) {
            setError(deleteError.message);
        }
    };

    return (
        <RoleGate path="/action-plan">
            <section className="stack">
                <h2>Action Plan</h2>

                {error ? <p className="notice error">{error}</p> : null}
                {message ? <p className="notice">{message}</p> : null}

                <section className="toolbar">
                    <label>
                        Select Ticket
                        <select
                            value={selectedTicketId}
                            onChange={(event) => setSelectedTicketId(event.target.value)}
                            disabled={loadingTickets}
                        >
                            <option value="">Select ticket</option>
                            {tickets.map((ticket) => (
                                <option key={ticket.id} value={ticket.id}>
                                    {ticket.title} ({ticket.target})
                                </option>
                            ))}
                        </select>
                    </label>
                </section>

                <section className="table-wrap">
                    <h3>Ticket Context</h3>
                    {!selectedTicket ? (
                        <p>กรุณาเลือก Ticket เพื่อแก้ Action Plan</p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Ticket</th>
                                    <th>Target</th>
                                    <th>Ability</th>
                                    <th>Response Person</th>
                                    <th>Start</th>
                                    <th>End</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{selectedTicket.title}</td>
                                    <td>{selectedTicket.target}</td>
                                    <td>{selectedTicket.abilityName || "-"}</td>
                                    <td>{selectedTicket.responsePerson}</td>
                                    <td>{selectedTicket.startDate}</td>
                                    <td>{selectedTicket.endDate}</td>
                                </tr>
                            </tbody>
                        </table>
                    )}
                </section>

                <form className="form-grid" onSubmit={onSubmit}>
                    <label>
                        Action
                        <input name="action" value={form.action} onChange={onChangeForm} placeholder="ระบุ action" />
                    </label>
                    <label>
                        Status
                        <input name="status" value={form.status} onChange={onChangeForm} placeholder="Pending / In Progress / Done" />
                    </label>
                    <label>
                        Duration(min)
                        <input type="number" min="0" name="duration" value={form.duration} onChange={onChangeForm} />
                    </label>
                    <label>
                        Exp.Start
                        <input type="datetime-local" name="start" value={form.start} onChange={onChangeForm} />
                    </label>
                    <label>
                        Exp.End
                        <input type="datetime-local" name="end" value={form.end} onChange={onChangeForm} />
                    </label>
                    <label>
                        Remark
                        <textarea
                            name="remark"
                            value={form.remark}
                            onChange={onChangeForm}
                            rows={3}
                            placeholder="หมายเหตุ"
                        />
                    </label>
                    <button type="submit" disabled={!selectedTicketId}>
                        {editingId ? "Update Row" : "Add Row"}
                    </button>
                    {editingId ? (
                        <button type="button" className="btn-secondary" onClick={resetForm}>
                            Cancel Edit
                        </button>
                    ) : null}
                </form>

                <section className="table-wrap">
                    <h3>Action Plan Rows</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Action</th>
                                <th>Status</th>
                                <th>Duration(min)</th>
                                <th>Exp.Start</th>
                                <th>Exp.End</th>
                                <th>Remark</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loadingRows ? (
                                <tr>
                                    <td colSpan={8}>กำลังโหลดข้อมูล...</td>
                                </tr>
                            ) : rows.length === 0 ? (
                                <tr>
                                    <td colSpan={8}>ยังไม่มีข้อมูล Action Plan</td>
                                </tr>
                            ) : (
                                rows.map((row, index) => (
                                    <tr key={row.id}>
                                        <td>{index + 1}</td>
                                        <td>{row.action}</td>
                                        <td>{row.status}</td>
                                        <td>{row.duration}</td>
                                        <td>{toDateTimeInputValue(row.start).replace("T", " ")}</td>
                                        <td>{toDateTimeInputValue(row.end).replace("T", " ")}</td>
                                        <td>{row.remark || "-"}</td>
                                        <td>
                                            <div className="inline-actions">
                                                <button type="button" className="btn-secondary" onClick={() => onEdit(row)}>
                                                    Edit
                                                </button>
                                                <button type="button" className="btn-danger" onClick={() => onDelete(row.id)}>
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
