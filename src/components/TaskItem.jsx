import React, { useState } from "react";
import { format } from "date-fns";
import {
    Check,
    Trash2,
    Clock,
    ChevronDown,
    ChevronUp,
    Flag,
    Calendar,
    Tag
} from "lucide-react";

const TaskItem = ({ task, onToggle, onDelete, onUpdate }) => {
    const [expanded, setExpanded] = useState(false);

    // Helper to handle subtasks toggling
    // Note: Firestore update logic must be handled by parent or a service call passed down
    const toggleSubtask = (subTaskId) => {
        const updatedSubtasks = task.subtasks.map(st =>
            st.id === subTaskId ? { ...st, completed: !st.completed } : st
        );
        onUpdate(task.id, { subtasks: updatedSubtasks });
    };

    const priorityColor = {
        high: "#ef4444",
        medium: "#fbbf24",
        low: "#10b981",
    }[task.priority || "medium"];

    return (
        <div style={styles.container}>
            {/* Main Row */}
            <div style={styles.mainRow}>
                <button
                    onClick={() => onToggle(task.id)}
                    style={{
                        ...styles.checkbox,
                        background: task.completed ? "#a75885" : "transparent",
                        borderColor: task.completed ? "#a75885" : "rgba(255,255,255,0.3)"
                    }}
                >
                    {task.completed && <Check size={12} color="#fff" />}
                </button>

                <div style={styles.content}>
                    <div style={{
                        ...styles.text,
                        textDecoration: task.completed ? "line-through" : "none",
                        opacity: task.completed ? 0.5 : 1
                    }}>
                        {task.text}
                    </div>

                    <div style={styles.meta}>
                        <span style={{ color: priorityColor, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Flag size={12} /> {task.priority}
                        </span>
                        {task.dueDate && (
                            <span style={styles.tag}>
                                <Calendar size={12} />
                                {task.dueDate.seconds ? format(new Date(task.dueDate.seconds * 1000), "MMM d") : "Date"}
                            </span>
                        )}
                        <span style={styles.tag}>
                            <Tag size={12} />
                            {task.category}
                        </span>
                    </div>
                </div>

                <div style={styles.actions}>
                    <button onClick={() => onDelete(task.id)} style={styles.iconBtn}>
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Subtasks (if we add them later, hook it up here) */}
        </div>
    );
};

const styles = {
    container: {
        background: "rgba(255, 255, 255, 0.03)",
        borderRadius: "12px",
        marginBottom: "12px",
        padding: "16px",
        border: "1px solid rgba(255, 255, 255, 0.03)",
        transition: "all 0.2s",
    },
    mainRow: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
    },
    checkbox: {
        width: "22px",
        height: "22px",
        borderRadius: "6px",
        border: "2px solid",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        padding: 0,
        transition: "all 0.2s",
    },
    content: {
        flex: 1,
    },
    text: {
        fontSize: "16px",
        fontWeight: "500",
        color: "#fff",
        marginBottom: "4px",
    },
    meta: {
        display: "flex",
        gap: "12px",
        fontSize: "12px",
        color: "rgba(255, 255, 255, 0.5)",
    },
    tag: {
        display: "flex",
        alignItems: "center",
        gap: "4px",
    },
    actions: {
        display: "flex",
        gap: "8px",
    },
    iconBtn: {
        background: "transparent",
        border: "none",
        color: "rgba(255, 255, 255, 0.4)",
        cursor: "pointer",
        padding: "4px",
    },
};

export default TaskItem;
