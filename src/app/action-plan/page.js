"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
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
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ActionPlanPageInner />
        </Suspense>
    );
}

function ActionPlanPageInner() {
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
            {/* ...existing code... (คัดลอกเนื้อหาเดิมทั้งหมดของ return) */}
            {/* เนื้อหาเดิมทั้งหมดของ return ด้านบนนี้จะถูกย้ายมาอยู่ในฟังก์ชันนี้ */}
        </RoleGate>
    );
}
