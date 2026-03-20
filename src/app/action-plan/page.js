"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import RoleGate from "@/components/RoleGate";
import { useAppData } from "@/context/AppDataContext";
import { requestJson } from "@/lib/client-api";
import { hasPermission, PERMISSIONS } from "@/lib/roles";

const initialForm = {
    phase: "",
    itemNo: "",
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

function moveRow(list, fromIndex, toIndex) {
    const next = [...list];
    const [item] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, item);
    return next;
}

function isRollbackPhase(phase) {
    return String(phase || "").trim().toLowerCase() === "rollback";
}

export default function ActionPlanPage() {
    const { state } = useAppData();
    const searchParams = useSearchParams();
    const ticketId = searchParams.get("ticketId") || "";
    const canAddActionPlan = hasPermission(state.user, PERMISSIONS.actionPlansAdd);
    const canEditActionPlan = hasPermission(state.user, PERMISSIONS.actionPlansEdit);
    const canDeleteActionPlan = hasPermission(state.user, PERMISSIONS.actionPlansDelete);

    const [tickets, setTickets] = useState([]);
    const [rows, setRows] = useState([]);
    const [selectedTicketId, setSelectedTicketId] = useState(ticketId);
    const [form, setForm] = useState(initialForm);
    const [editingId, setEditingId] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loadingTickets, setLoadingTickets] = useState(false);
    const [loadingRows, setLoadingRows] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [importResult, setImportResult] = useState(null);
    const [draggingId, setDraggingId] = useState("");
    const [clearingRows, setClearingRows] = useState(false);

    useEffect(() => {
        setSelectedTicketId(ticketId);
    }, [ticketId]);

    const reloadRows = async (currentTicketId) => {
        if (!currentTicketId) {
            setRows([]);
            return;
        }

        const params = new URLSearchParams({ ticketId: currentTicketId });
        const data = await requestJson(`/api/action-plans?${params.toString()}`);
        setRows(data.items || []);
    };

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
            setLoadingRows(true);
            try {
                setError("");
                await reloadRows(selectedTicketId);
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
        setImportResult(null);
    }, [selectedTicketId]);

    const selectedTicket = useMemo(
        () => tickets.find((ticket) => ticket.id === selectedTicketId) || null,
        [tickets, selectedTicketId],
    );

    const rollbackRows = useMemo(
        () => rows.filter((row) => isRollbackPhase(row.phase)),
        [rows],
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

        if (editingId && !canEditActionPlan) {
            setError("forbidden");
            return;
        }

        if (!editingId && !canAddActionPlan) {
            setError("forbidden");
            return;
        }

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
                phase: form.phase,
                itemNo: form.itemNo,
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

            await reloadRows(selectedTicketId);
            resetForm();
        } catch (submitError) {
            setError(submitError.message);
        }
    };

    const onEdit = (row) => {
        if (!canEditActionPlan) {
            return;
        }

        setEditingId(row.id);
        setForm({
            phase: row.phase || "",
            itemNo: row.itemNo ? String(row.itemNo) : "",
            action: row.action,
            status: row.status,
            duration: String(row.duration ?? 0),
            start: toDateTimeInputValue(row.start),
            end: toDateTimeInputValue(row.end),
            remark: row.remark || "",
        });
    };

    const onDelete = async (rowId) => {
        if (!canDeleteActionPlan) {
            setError("forbidden");
            return;
        }

        const confirmed = window.confirm("ยืนยันการลบข้อมูลแถวนี้?");
        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setMessage("");

            await requestJson(`/api/action-plans/${rowId}`, { method: "DELETE" });
            await reloadRows(selectedTicketId);

            if (editingId === rowId) {
                resetForm();
            }

            setMessage("ลบแถว Action Plan แล้ว");
        } catch (deleteError) {
            setError(deleteError.message);
        }
    };

    const onImportCsv = async () => {
        if (!canAddActionPlan) {
            setError("forbidden");
            return;
        }

        if (!selectedTicketId || !importFile) {
            return;
        }

        const formData = new FormData();
        formData.append("ticketId", selectedTicketId);
        formData.append("file", importFile);

        try {
            setError("");
            setMessage("");
            const result = await requestJson("/api/action-plans/import", {
                method: "POST",
                body: formData,
            });

            setImportResult(result);
            setImportFile(null);
            await reloadRows(selectedTicketId);
            setMessage("นำเข้า CSV เสร็จสิ้น");
        } catch (importError) {
            setError(importError.message);
        }
    };

    const onClearCurrentActionPlan = async () => {
        if (!canDeleteActionPlan) {
            setError("forbidden");
            return;
        }

        if (!selectedTicketId) {
            return;
        }

        try {
            setClearingRows(true);
            setError("");
            setMessage("");

            const params = new URLSearchParams({ ticketId: selectedTicketId });
            const result = await requestJson(`/api/action-plans?${params.toString()}`, {
                method: "DELETE",
            });

            await reloadRows(selectedTicketId);
            setImportResult(null);
            setImportFile(null);
            resetForm();
            setMessage(`ล้าง Action Plan สำเร็จ ${result.clearedCount || 0} แถว`);
        } catch (clearError) {
            setError(clearError.message);
        } finally {
            setClearingRows(false);
        }
    };

    const onDropRow = async (targetId) => {
        if (!canEditActionPlan) {
            setError("forbidden");
            return;
        }

        if (!draggingId || draggingId === targetId) {
            return;
        }

        const fromIndex = rows.findIndex((row) => row.id === draggingId);
        const toIndex = rows.findIndex((row) => row.id === targetId);
        if (fromIndex < 0 || toIndex < 0) {
            return;
        }

        const reordered = moveRow(rows, fromIndex, toIndex);
        setRows(reordered);
        setDraggingId("");

        try {
            await requestJson("/api/action-plans/reorder", {
                method: "PUT",
                body: JSON.stringify({
                    ticketId: selectedTicketId,
                    orderedIds: reordered.map((row) => row.id),
                }),
            });
            setMessage("บันทึกลำดับรายการแล้ว");
        } catch (reorderError) {
            setError(reorderError.message);
            await reloadRows(selectedTicketId);
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

                <section className="stack">
                    <h3>Import CSV (1 file ต่อ 1 action plan)</h3>
                    <div className="toolbar">
                        <label>
                            CSV File (phase, No, action, status, duration, start, end, remark)
                            <input
                                type="file"
                                accept=".csv,text/csv"
                                onChange={(event) =>
                                    setImportFile(event.target.files && event.target.files[0] ? event.target.files[0] : null)
                                }
                            />
                        </label>
                        <button type="button" onClick={onImportCsv} disabled={!selectedTicketId || !importFile || !canAddActionPlan}>
                            Import CSV
                        </button>
                        <button
                            type="button"
                            className="btn-danger"
                            onClick={onClearCurrentActionPlan}
                            disabled={!selectedTicketId || !canDeleteActionPlan || clearingRows}
                        >
                            {clearingRows ? "Clearing..." : "Clear Current Action Plan Items"}
                        </button>
                    </div>
                    {importResult ? (
                        <div className="table-wrap">
                            <p>
                                Imported: {importResult.insertedCount} row(s), Failed: {importResult.failedCount} row(s)
                            </p>
                            {importResult.failures?.length ? (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>CSV Row</th>
                                            <th>Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {importResult.failures.map((item) => (
                                            <tr key={`${item.row}-${item.reason}`}>
                                                <td>{item.row}</td>
                                                <td>{item.reason}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : null}
                        </div>
                    ) : null}
                </section>

                {canAddActionPlan || canEditActionPlan ? (
                    <form className="form-grid" onSubmit={onSubmit}>
                        <label>
                            Phase
                            <input name="phase" value={form.phase} onChange={onChangeForm} placeholder="เช่น P1" />
                        </label>
                        <label>
                            No
                            <input type="number" min="0" name="itemNo" value={form.itemNo} onChange={onChangeForm} placeholder="ลำดับในเฟส" />
                        </label>
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
                        <button type="submit" disabled={!selectedTicketId || (editingId ? !canEditActionPlan : !canAddActionPlan)}>
                            {editingId ? "Update Row" : "Add Row"}
                        </button>
                        {editingId ? (
                            <button type="button" className="btn-secondary" onClick={resetForm}>
                                Cancel Edit
                            </button>
                        ) : null}
                    </form>
                ) : null}

                <section className="table-wrap">
                    <h3>Action Plan Rows (drag row เพื่อเปลี่ยนลำดับ)</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Phase</th>
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
                                    <td colSpan={10}>กำลังโหลดข้อมูล...</td>
                                </tr>
                            ) : rows.length === 0 ? (
                                <tr>
                                    <td colSpan={10}>ยังไม่มีข้อมูล Action Plan</td>
                                </tr>
                            ) : (
                                rows.map((row, index) => (
                                    editingId === row.id ? (
                                        <tr key={row.id} className="editing-row">
                                            <td>{index + 1}</td>
                                            <td>
                                                <input name="phase" value={form.phase} onChange={onChangeForm} />
                                            </td>
                                            <td>
                                                <input type="number" min="0" name="itemNo" value={form.itemNo} onChange={onChangeForm} />
                                            </td>
                                            <td>
                                                <input name="action" value={form.action} onChange={onChangeForm} />
                                            </td>
                                            <td>
                                                <input name="status" value={form.status} onChange={onChangeForm} />
                                            </td>
                                            <td>
                                                <input type="number" min="0" name="duration" value={form.duration} onChange={onChangeForm} />
                                            </td>
                                            <td>
                                                <input type="datetime-local" name="start" value={form.start} onChange={onChangeForm} />
                                            </td>
                                            <td>
                                                <input type="datetime-local" name="end" value={form.end} onChange={onChangeForm} />
                                            </td>
                                            <td>
                                                <textarea name="remark" value={form.remark} onChange={onChangeForm} rows={2} />
                                            </td>
                                            <td>
                                                <div className="inline-actions">
                                                    <button type="button" className="btn-primary" onClick={onSubmit}>
                                                        Save
                                                    </button>
                                                    <button type="button" className="btn-secondary" onClick={resetForm}>
                                                        Cancel
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr
                                            key={row.id}
                                            draggable={canEditActionPlan}
                                            onDragStart={() => setDraggingId(row.id)}
                                            onDragOver={(event) => event.preventDefault()}
                                            onDrop={() => onDropRow(row.id)}
                                        >
                                            <td>{index + 1}</td>
                                            <td>{row.phase || "-"}</td>
                                            <td>{row.itemNo ?? "-"}</td>
                                            <td>{row.action}</td>
                                            <td>{row.status}</td>
                                            <td>{row.duration}</td>
                                            <td>{toDateTimeInputValue(row.start).replace("T", " ")}</td>
                                            <td>{toDateTimeInputValue(row.end).replace("T", " ")}</td>
                                            <td>{row.remark || "-"}</td>
                                            <td>
                                                <div className="inline-actions">
                                                    {canEditActionPlan && !editingId ? (
                                                        <button type="button" className="btn-secondary" onClick={() => onEdit(row)}>
                                                            Edit
                                                        </button>
                                                    ) : null}
                                                    {canDeleteActionPlan && !editingId ? (
                                                        <button type="button" className="btn-danger" onClick={() => onDelete(row.id)}>
                                                            Delete
                                                        </button>
                                                    ) : null}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                ))
                            )}
                        </tbody>
                    </table>
                </section>

                <section className="table-wrap">
                    <h3>Rollback plan (drag row เพื่อเปลี่ยนลำดับ)</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Phase</th>
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
                                    <td colSpan={10}>กำลังโหลดข้อมูล...</td>
                                </tr>
                            ) : rollbackRows.length === 0 ? (
                                <tr>
                                    <td colSpan={10}>ยังไม่มีรายการ Rollback plan</td>
                                </tr>
                            ) : (
                                rollbackRows.map((row, index) => (
                                    <tr
                                        key={`rollback-${row.id}`}
                                        draggable={canEditActionPlan}
                                        onDragStart={() => setDraggingId(row.id)}
                                        onDragOver={(event) => event.preventDefault()}
                                        onDrop={() => {
                                            // หา index จริงใน rows (ไม่ใช่เฉพาะ rollbackRows)
                                            const fromIndex = rows.findIndex((r) => r.id === draggingId);
                                            const toIndex = rows.findIndex((r) => r.id === row.id);
                                            if (fromIndex >= 0 && toIndex >= 0 && fromIndex !== toIndex) {
                                                onDropRow(row.id);
                                            }
                                        }}
                                    >
                                        <td>{index + 1}</td>
                                        <td>{row.phase || "-"}</td>
                                        <td>{row.itemNo ?? "-"}</td>
                                        <td>{row.action}</td>
                                        <td>{row.status}</td>
                                        <td>{row.duration}</td>
                                        <td>{toDateTimeInputValue(row.start).replace("T", " ")}</td>
                                        <td>{toDateTimeInputValue(row.end).replace("T", " ")}</td>
                                        <td>{row.remark || "-"}</td>
                                        <td>
                                            <div className="inline-actions">
                                                {canEditActionPlan ? (
                                                    <button type="button" className="btn-secondary" onClick={() => onEdit(row)}>
                                                        Edit
                                                    </button>
                                                ) : null}
                                                {canDeleteActionPlan ? (
                                                    <button type="button" className="btn-danger" onClick={() => onDelete(row.id)}>
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
