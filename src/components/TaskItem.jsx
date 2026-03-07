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
        background: "rgba(255, 255, 255, 0.02)",
        borderRadius: "16px",
        padding: "16px 20px",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "default",
        ":hover": {
            background: "rgba(255, 255, 255, 0.04)",
            transform: "translateY(-2px)",
            borderColor: "rgba(255, 255, 255, 0.1)",
        }
    },
    mainRow: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
    },
    checkbox: {
        width: "24px",
        height: "24px",
        borderRadius: "8px",
        border: "2px solid",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        padding: 0,
        transition: "all 0.2s ease",
        flexShrink: 0,
    },
    content: {
        flex: 1,
        minWidth: 0, // Prevent text overflow
    },
    text: {
        fontSize: "16px",
        fontWeight: "600",
        color: "#fff",
        marginBottom: "6px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    meta: {
        display: "flex",
        gap: "16px",
        fontSize: "12px",
        color: "rgba(255, 255, 255, 0.4)",
        flexWrap: "wrap",
    },
    tag: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: "rgba(255,255,255,0.03)",
        padding: "2px 8px",
        borderRadius: "4px",
        textTransform: "capitalize",
    },
    actions: {
        display: "flex",
        gap: "4px",
        opacity: 0.6,
        transition: "opacity 0.2s",
        ":hover": { opacity: 1 }
    },
    iconBtn: {
        background: "transparent",
        border: "none",
        color: "rgba(255, 255, 255, 0.4)",
        cursor: "pointer",
        padding: "8px",
        borderRadius: "8px",
        transition: "all 0.2s",
        ":hover": {
            background: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444",
        }
    },
};

export default TaskItem;
