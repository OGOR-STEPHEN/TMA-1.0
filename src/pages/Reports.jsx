import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { auth } from "../firebase/config";
import { fetchTasksFromDB } from "../firebase/tasks";
import { onAuthStateChanged } from "firebase/auth";

const Reports = () => {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (user) fetchTasksFromDB(user.uid, setTasks);
        });
        return unsub;
    }, []);

    // Data processing
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed || t.status === "done").length;
    const active = total - completed;

    const dataStatus = [
        { name: "Completed", value: completed },
        { name: "Active", value: active },
    ];

    const COLORS = ["#10b981", "#a75885"];

    // Priority distribution
    const high = tasks.filter(t => t.priority === "high").length;
    const medium = tasks.filter(t => t.priority === "medium").length;
    const low = tasks.filter(t => t.priority === "low").length;

    const dataPriority = [
        { name: "High", count: high },
        { name: "Medium", count: medium },
        { name: "Low", count: low },
    ];

    return (
        <Layout>
            <div style={styles.header}>
                <h1>Analytics Report</h1>
            </div>

            <div style={styles.grid}>
                {/* Summary Cards */}
                <div style={styles.card}>
                    <h3>Completion Rate</h3>
                    <div style={styles.bigNumber}>
                        {total === 0 ? 0 : Math.round((completed / total) * 100)}%
                    </div>
                </div>
                <div style={styles.card}>
                    <h3>Total Tasks</h3>
                    <div style={styles.bigNumber}>{total}</div>
                </div>

                {/* Charts */}
                <div style={{ ...styles.card, gridColumn: "span 2" }}>
                    <h3>Task Status</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={dataStatus}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {dataStatus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: '#1e293b', border: 'none' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div style={{ ...styles.card, gridColumn: "span 2" }}>
                    <h3>Tasks by Priority</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={dataPriority}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" stroke="#fff" />
                                <YAxis stroke="#fff" />
                                <Tooltip contentStyle={{ background: '#1e293b', border: 'none' }} />
                                <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

const styles = {
    header: { marginBottom: "30px" },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "20px"
    },
    card: {
        background: "rgba(255,255,255,0.03)",
        padding: "20px",
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "150px"
    },
    bigNumber: {
        fontSize: "48px",
        fontWeight: "bold",
        background: "linear-gradient(135deg, #a75885, #8f3a76)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent"
    }
};

export default Reports;
