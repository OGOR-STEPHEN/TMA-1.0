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
import jsPDF from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import { Download, FileText } from "lucide-react";

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

    const generatePDF = () => {
        const doc = new jsPDF();
        const date = new Date().toLocaleDateString();
        const completedTasks = tasks.filter(t => t.completed || t.status === "done");

        // Header
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text("Daily Activity Report", 20, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${date}`, 20, 30);

        // Separator
        doc.setLineWidth(0.5);
        doc.setDrawColor(200);
        doc.line(20, 35, 190, 35);

        let yPos = 50;
        doc.setFontSize(14);
        doc.setTextColor(0);

        // Narrative Section
        if (completedTasks.length > 0) {
            doc.setFont(undefined, 'bold');
            doc.text("Summary:", 20, yPos);
            yPos += 10;

            doc.setFont(undefined, 'normal');
            doc.setFontSize(12);
            // Constructing narrative: "Today i washed the dishes and cleaned my room"
            // We use the task text directly.
            const taskListPhrase = completedTasks.map((t, i) => {
                const text = t.text.trim();
                return (i === completedTasks.length - 1 && i > 0) ? `and ${text}` : text;
            }).join(completedTasks.length > 2 ? ", " : " ");

            const narrative = `Today I ${taskListPhrase}.`;
            const splitNarrative = doc.splitTextToSize(narrative, 170);
            doc.text(splitNarrative, 20, yPos);
            yPos += splitNarrative.length * 7 + 10;

            // List Details
            doc.setFont(undefined, 'bold');
            doc.setFontSize(14);
            doc.text("Task Details:", 20, yPos);
            yPos += 10;
            doc.setFont(undefined, 'normal');
            doc.setFontSize(12);

            completedTasks.forEach(t => {
                doc.text(`• ${t.text} (${t.priority})`, 25, yPos);
                yPos += 7;
            });
        } else {
            doc.text("No tasks completed today.", 20, yPos);
        }

        doc.save(`TMA_Report_${date.replace(/\//g, "-")}.pdf`);
    };

    const generateDOC = () => {
        const date = new Date().toLocaleDateString();
        const completedTasks = tasks.filter(t => t.completed || t.status === "done");

        const taskListPhrase = completedTasks.length > 0 ? completedTasks.map((t, i) => {
            const text = t.text.trim();
            return (i === completedTasks.length - 1 && i > 0) ? `and ${text}` : text;
        }).join(completedTasks.length > 2 ? ", " : " ") : "";

        const narrative = completedTasks.length > 0
            ? `Today I ${taskListPhrase}.`
            : "No tasks completed today.";

        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: "Daily Activity Report",
                        heading: HeadingLevel.HEADING_1,
                    }),
                    new Paragraph({
                        text: `Generated on: ${date}`,
                        color: "888888"
                    }),
                    new Paragraph({ text: "" }),
                    new Paragraph({
                        text: "Summary",
                        heading: HeadingLevel.HEADING_2
                    }),
                    new Paragraph({
                        text: narrative
                    }),
                    new Paragraph({ text: "" }),
                    new Paragraph({
                        text: "Task Details",
                        heading: HeadingLevel.HEADING_2
                    }),
                    ...completedTasks.map(t => new Paragraph({
                        text: `• ${t.text} [${t.priority}]`,
                        bullet: { level: 0 }
                    }))
                ]
            }]
        });

        Packer.toBlob(doc).then(blob => {
            saveAs(blob, `TMA_Report_${date.replace(/\//g, "-")}.docx`);
        });
    };

    return (
        <Layout>
            <div style={styles.header}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>Analytics Report</h1>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={generatePDF} style={styles.button}>
                            <Download size={18} /> PDF
                        </button>
                        <button onClick={generateDOC} style={styles.button}>
                            <FileText size={18} /> DOC
                        </button>
                    </div>
                </div>
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
    },
    button: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "rgba(167, 88, 133, 0.2)",
        color: "#a75885",
        border: "1px solid rgba(167, 88, 133, 0.4)",
        padding: "8px 16px",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "bold",
        transition: "all 0.2s",
    }
};

export default Reports;
