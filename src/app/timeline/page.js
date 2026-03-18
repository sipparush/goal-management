"use client";

import { useEffect, useState } from "react";
import RoleGate from "@/components/RoleGate";
import StatusPill from "@/components/StatusPill";
import { useAppData } from "@/context/AppDataContext";
import { requestJson } from "@/lib/client-api";

export default function TimelinePage() {
    const { state } = useAppData();
    const [rows, setRows] = useState([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!state.user) {
            return;
        }

        async function loadTimeline() {
            try {
                setError("");
                const params = new URLSearchParams({
                    status: statusFilter,
                    search,
                    goalId: "all",
                });

                const data = await requestJson(`/api/projects?${params.toString()}`);
                setRows(data.items || []);
            } catch (loadError) {
                setError(loadError.message);
            }
        }

        loadTimeline();
    }, [statusFilter, search, state.user]);

    return (
        <RoleGate path="/timeline">
            <section className="stack">
                <h2>Project Timeline (All Projects)</h2>
                {error ? <p className="notice error">{error}</p> : null}

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
                        Status Filter
                        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                            <option value="all">All</option>
                            <option value="in-time">In Time</option>
                            <option value="delay">Delay</option>
                        </select>
                    </label>
                </section>

                <section className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>Timeline</th>
                                <th>Project</th>
                                <th>Goal</th>
                                <th>Target</th>
                                <th>Start</th>
                                <th>End</th>
                                <th>Duration</th>
                                <th>Status</th>
                                <th>Response Person</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan={9}>ยังไม่มีข้อมูล Project Timeline</td>
                                </tr>
                            ) : (
                                rows.map((project) => (
                                    <tr key={project.id}>
                                        <td>
                                            {project.startDate} to {project.endDate}
                                        </td>
                                        <td>{project.name}</td>
                                        <td>{project.goalName || "-"}</td>
                                        <td>{project.target}</td>
                                        <td>{project.startDate}</td>
                                        <td>{project.endDate}</td>
                                        <td>{project.durationDays} days</td>
                                        <td>
                                            <StatusPill status={project.status} />
                                        </td>
                                        <td>{project.responsePerson}</td>
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
