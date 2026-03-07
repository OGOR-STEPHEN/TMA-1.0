import React, { useContext, useMemo, useState } from "react";
import { Calendar, Clock, Tag, Flag, Save } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { SettingsContext } from "../context/SettingsContext";

const TaskForm = ({ onAdd, onCancel }) => {
    const contextValue = useContext(SettingsContext);
    const theme = contextValue?.theme || FALLBACK_THEME;
    const themedStyles = useMemo(() => getStyles(theme), [theme]);
    const isDark = theme.name !== "light";

    const [text, setText] = useState("");
    const [priority, setPriority] = useState("medium"); // low, medium, high
    const [category, setCategory] = useState("personal"); // work, personal, learning
    const [dueDate, setDueDate] = useState(null);
    const [dueTime, setDueTime] = useState("");
    const [error, setError] = useState("");

    const validateTask = (value) => {
        if (!value.trim()) return "Task description cannot be empty.";
        if (value.length > 100) return "Task description is too long (max 100 characters).";
        if (/[^\w\s.,!?'-]/.test(value)) return "Task description contains invalid characters.";
        return "";
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationError = validateTask(text);
        if (validationError) {
            setError(validationError);
            return;
        }
        setError("");

        onAdd({
            text,
            priority,
            category,
            dueDate,
            dueTime: dueTime || null,
            reminderTime: dueTime || null,
            subtasks: [],
            status: "todo",
        });

        setText("");
        setPriority("medium");
        setCategory("personal");
        setDueDate(null);
        setDueTime("");
    };

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                ...themedStyles.form,
                "--task-option-bg": isDark ? "#1f2937" : "#ffffff",
                "--task-option-color": theme.text,
                "--dp-bg": isDark ? "#1e293b" : "#ffffff",
                "--dp-header-bg": isDark ? "#0f172a" : "#f3f4f6",
                "--dp-border": theme.border,
                "--dp-text": theme.text,
                "--dp-hover": isDark ? "#334155" : "#e5e7eb",
                "--dp-muted": theme.textMuted,
                "--time-picker-filter": isDark ? "invert(0.86)" : "invert(0.24)",
            }}
            aria-label="Add new task"
        >
            <div style={themedStyles.mainInputContainer}>
                <input
                    autoFocus
                    type="text"
                    placeholder="What needs to be done?"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    style={themedStyles.input}
                    className="task-input"
                    aria-label="Task description"
                />
                {error && (
                    <div style={{ color: "#ef4444", fontSize: "13px", marginTop: "6px" }} role="alert">
                        {error}
                    </div>
                )}
            </div>

            <div style={themedStyles.controls}>
                <div style={themedStyles.options}>
                    {/* Priority Selector */}
                    <div style={themedStyles.selectWrapper}>
                        <Flag size={16} color={getPriorityColor(priority)} aria-hidden="true" />
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            style={themedStyles.select}
                            className="task-select"
                            aria-label="Select priority"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    {/* Category Selector */}
                    <div style={themedStyles.selectWrapper}>
                        <Tag size={16} aria-hidden="true" />
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            style={themedStyles.select}
                            className="task-select"
                            aria-label="Select category"
                        >
                            <option value="personal">Personal</option>
                            <option value="work">Work</option>
                            <option value="learning">Learning</option>
                            <option value="health">Health</option>
                        </select>
                    </div>

                    {/* Date Picker */}
                    <div style={themedStyles.dateWrapper}>
                        <Calendar size={16} />
                        <DatePicker
                            selected={dueDate}
                            onChange={(date) => setDueDate(date)}
                            placeholderText="Due date"
                            className="custom-datepicker"
                            dateFormat="MMM d"
                            minDate={new Date()}
                        />
                    </div>

                    {/* Time Picker */}
                    <div style={themedStyles.timeWrapper}>
                        <Clock size={16} />
                        <input
                            type="time"
                            value={dueTime}
                            onChange={(e) => setDueTime(e.target.value)}
                            className="task-time-input"
                            style={themedStyles.timeInput}
                            aria-label="Select due time"
                            step="60"
                        />
                    </div>
                </div>

                <button type="submit" style={themedStyles.addButton}>
                    <Save size={18} className="mobile-hide" />
                    <span>Add</span>
                </button>
            </div>

            <style>{`
        .task-input::placeholder {
          color: var(--dp-muted);
        }
        .task-select {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
        }
        .task-select option {
          background: var(--task-option-bg);
          color: var(--task-option-color);
        }
        .task-time-input::-webkit-calendar-picker-indicator {
          filter: var(--time-picker-filter);
          cursor: pointer;
        }
        .react-datepicker-wrapper { width: auto; }
        .react-datepicker__input-container input {
          background: transparent;
          border: none;
          color: inherit;
          font-size: 14px;
          width: 100px;
          cursor: pointer;
        }
        .react-datepicker__input-container input::placeholder {
          color: var(--dp-muted);
        }
        .react-datepicker__input-container input:focus { outline: none; }
        .react-datepicker {
          background: var(--dp-bg);
          border: 1px solid var(--dp-border);
          font-family: inherit;
        }
        .react-datepicker__header {
          background: var(--dp-header-bg);
          border-bottom: 1px solid var(--dp-border);
        }
        .react-datepicker__current-month, .react-datepicker__day-name, .react-datepicker__day {
          color: var(--dp-text);
        }
        .react-datepicker__day:hover {
          background: var(--dp-hover);
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

const FALLBACK_THEME = {
    name: "dark",
    text: "#E6EEF3",
    textMuted: "#A0AEC0",
    cardBackground: "rgba(0,0,0,0.35)",
    buttonBackground: "rgba(255,255,255,0.04)",
    border: "rgba(255,255,255,0.05)",
    primaryShadow: "0 10px 28px rgba(167,88,133,0.28)",
};

const getSelectArrow = (hexColor) =>
    `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='${hexColor.replace(
        "#",
        "%23"
    )}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`;

const getStyles = (theme) => ({
    form: {
        background: theme.cardBackground,
        padding: "20px",
        borderRadius: "16px",
        border: `1px solid ${theme.border}`,
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
        color: theme.text,
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
        background: theme.buttonBackground,
        padding: "6px 12px",
        borderRadius: "10px",
        fontSize: "13px",
        color: theme.textMuted,
        border: `1px solid ${theme.border}`,
        minWidth: "100px",
    },
    select: {
        background: "transparent",
        border: "none",
        color: theme.text,
        fontSize: "13px",
        fontWeight: "600",
        outline: "none",
        cursor: "pointer",
        width: "100%",
        padding: "2px 20px 2px 0",
        backgroundImage: getSelectArrow(theme.textMuted),
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0 center",
        backgroundSize: "14px",
    },
    dateWrapper: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: theme.buttonBackground,
        padding: "6px 12px",
        borderRadius: "10px",
        fontSize: "13px",
        color: theme.textMuted,
        border: `1px solid ${theme.border}`,
    },
    timeWrapper: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: theme.buttonBackground,
        padding: "6px 12px",
        borderRadius: "10px",
        fontSize: "13px",
        color: theme.textMuted,
        border: `1px solid ${theme.border}`,
    },
    timeInput: {
        background: "transparent",
        border: "none",
        color: theme.text,
        fontSize: "13px",
        fontWeight: "600",
        outline: "none",
        cursor: "pointer",
        width: "84px",
        padding: "2px 0",
    },
    addButton: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 24px",
        background: "linear-gradient(135deg, #a75885, #8f3a76)",
        border: "none",
        borderRadius: "10px",
        color: "#fff",
        fontWeight: "700",
        fontSize: "14px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: theme.primaryShadow || "0 4px 12px rgba(167, 88, 133, 0.2)",
    },
});

export default TaskForm;
