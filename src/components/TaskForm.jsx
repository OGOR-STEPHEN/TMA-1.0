import React, { useState } from "react";
import { Calendar, Clock, Tag, Flag, Save, X } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// Helper to override DatePicker default styles via CSS class is tricky with inline styles, 
// so we might need a small css file or style injection. For now we will rely on default and some overrides.

const TaskForm = ({ onAdd, onCancel }) => {
    const [text, setText] = useState("");
    const [priority, setPriority] = useState("medium"); // low, medium, high
    const [category, setCategory] = useState("personal"); // work, personal, learning
    const [dueDate, setDueDate] = useState(null);
    // We can add reminderTime later or link it to dueDate

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        onAdd({
            text,
            priority,
            category,
            dueDate,
            subtasks: [],
            status: "todo",
        });

        setText("");
        setPriority("medium");
        setCategory("personal");
        setDueDate(null);
    };

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.mainInputContainer}>
                <input
                    autoFocus
                    type="text"
                    placeholder="What needs to be done?"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    style={styles.input}
                />
            </div>

            <div style={styles.controls}>
                <div style={styles.options}>
                    {/* Priority Selector */}
                    <div style={styles.selectWrapper}>
                        <Flag size={16} color={getPriorityColor(priority)} />
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            style={styles.select}
                        >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                        </select>
                    </div>

                    {/* Category Selector */}
                    <div style={styles.selectWrapper}>
                        <Tag size={16} />
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            style={styles.select}
                        >
                            <option value="personal">Personal</option>
                            <option value="work">Work</option>
                            <option value="learning">Learning</option>
                            <option value="health">Health</option>
                        </select>
                    </div>

                    {/* Date Picker */}
                    <div style={styles.dateWrapper}>
                        <Calendar size={16} />
                        <DatePicker
                            selected={dueDate}
                            onChange={(date) => setDueDate(date)}
                            placeholderText="Set due date"
                            className="custom-datepicker" // We will need to inject styles for this
                            dateFormat="MMM d, yyyy"
                            minDate={new Date()}
                        />
                    </div>
                </div>

                <button type="submit" style={styles.addButton}>
                    <Save size={18} />
                    Add Task
                </button>
            </div>

            <style>{`
        .react-datepicker-wrapper { width: auto; }
        .react-datepicker__input-container input {
          background: transparent;
          border: none;
          color: inherit;
          font-size: 14px;
          width: 100px;
          cursor: pointer;
        }
        .react-datepicker__input-container input:focus { outline: none; }
        .react-datepicker {
          background: #1e293b;
          border: 1px solid #334155;
          font-family: inherit;
        }
        .react-datepicker__header {
          background: #0f172a;
          border-bottom: 1px solid #334155;
        }
        .react-datepicker__current-month, .react-datepicker__day-name, .react-datepicker__day {
          color: #e2e8f0;
        }
        .react-datepicker__day:hover {
          background: #334155;
        }
        .react-datepicker__day--selected {
          background: #a75885;
        }
      `}</style>
        </form>
    );
};

const getPriorityColor = (p) => {
    if (p === "high") return "#ef4444";
    if (p === "medium") return "#fbbf24";
    return "#10b981";
};

const styles = {
    form: {
        background: "rgba(255, 255, 255, 0.03)",
        padding: "20px",
        borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        marginBottom: "24px",
    },
    mainInputContainer: {
        marginBottom: "16px",
    },
    input: {
        width: "100%",
        background: "transparent",
        border: "none",
        fontSize: "18px",
        color: "#fff",
        outline: "none",
        padding: "8px 0",
    },
    controls: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px",
    },
    options: {
        display: "flex",
        gap: "16px",
        alignItems: "center",
    },
    selectWrapper: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: "rgba(255, 255, 255, 0.05)",
        padding: "6px 10px",
        borderRadius: "8px",
        fontSize: "14px",
        color: "rgba(255, 255, 255, 0.8)",
    },
    select: {
        background: "transparent",
        border: "none",
        color: "inherit",
        fontSize: "14px",
        outline: "none",
        cursor: "pointer",
    },
    dateWrapper: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: "rgba(255, 255, 255, 0.05)",
        padding: "6px 10px",
        borderRadius: "8px",
        fontSize: "14px",
        color: "rgba(255, 255, 255, 0.8)",
    },
    addButton: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 16px",
        background: "linear-gradient(135deg, #a75885, #8f3a76)",
        border: "none",
        borderRadius: "8px",
        color: "#fff",
        fontWeight: "600",
        cursor: "pointer",
        transition: "transform 0.1s",
    },
};

export default TaskForm;
