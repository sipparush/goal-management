"use client";

import { useEffect, useMemo, useState } from "react";
import RoleGate from "@/components/RoleGate";
import StatusPill from "@/components/StatusPill";
import { useAppData } from "@/context/AppDataContext";
import { requestJson } from "@/lib/client-api";

export default function HomePage() {
    const { state } = useAppData();
    const [goals, setGoals] = useState([]);
    const [projects, setProjects] = useState([]);
    const [abilities, setAbilities] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!state.user) {
            return;
        }

        async function load() {
            try {
                setError("");
                const [bootstrap, ticketData] = await Promise.all([
                    requestJson("/api/bootstrap"),
                    requestJson("/api/tickets"),
                ]);

                setGoals(bootstrap.goals || []);
                setProjects(bootstrap.projects || []);
                setAbilities(bootstrap.abilities || []);
                setTickets(ticketData.items || []);
            } catch (loadError) {
                setError(loadError.message);
            }
        }

        load();
    }, [state.user]);

    const summary = useMemo(
        () => ({
            goals: goals.length,
            projects: projects.length,
            abilities: abilities.length,
            tickets: tickets.length,
        }),
        [goals, projects, abilities, tickets],
    );

    return (
        <RoleGate path="/">
            <section className="stack">
                <h2>Goal / Target / Expect Overview</h2>

                {error ? <p className="notice error">{error}</p> : null}

                <div className="metric-grid">
                    <article className="metric-box">
                        <p>Goals</p>
                        <h3>{summary.goals}</h3>
                    </article>
                    <article className="metric-box">
                        <p>Projects</p>
                        <h3>{summary.projects}</h3>
                    </article>
                    <article className="metric-box">
                        <p>Abilities</p>
                        <h3>{summary.abilities}</h3>
                    </article>
                    <article className="metric-box">
                        <p>Tickets</p>
                        <h3>{summary.tickets}</h3>
                    </article>
                </div>

                <section className="table-wrap">
                    <h3>Goal Dashboard</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Goal</th>
                                <th>Target</th>
                                <th>Current Target</th>
                                <th>Expect</th>
                            </tr>
                        </thead>
                        <tbody>
                            {goals.length === 0 ? (
                                <tr>
                                    <td colSpan={4}>ยังไม่มี Goal กรุณาเพิ่มข้อมูลในหน้า Goal Management</td>
                                </tr>
                            ) : (
                                goals.map((goal) => (
                                    <tr key={goal.id}>
                                        <td>{goal.name}</td>
                                        <td>{goal.target}</td>
                                        <td>{goal.currentTarget || "-"}</td>
                                        <td>{goal.expect || "-"}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </section>

                <section className="table-wrap">
                    <h3>Project Status Snapshot</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Project</th>
                                <th>Goal</th>
                                <th>Duration (days)</th>
                                <th>Start</th>
                                <th>End</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.length === 0 ? (
                                <tr>
                                    <td colSpan={6}>ยังไม่มี Project</td>
                                </tr>
                            ) : (
                                projects.map((project) => (
                                    <tr key={project.id}>
                                        <td>{project.name}</td>
                                        <td>{project.goalName || "-"}</td>
                                        <td>{project.durationDays}</td>
                                        <td>{project.startDate}</td>
                                        <td>{project.endDate}</td>
                                        <td>
                                            <StatusPill status={project.status} />
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
