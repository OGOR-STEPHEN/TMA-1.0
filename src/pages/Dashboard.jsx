import { auth } from "../firebase/config";
import {
  addTaskToDB,
  fetchTasksFromDB,
  updateTaskInDB,
  deleteTaskFromDB,
} from "../firebase/tasks";
import { onAuthStateChanged } from "firebase/auth";
import { useState, useEffect, useContext, useRef } from "react";
import React from "react";
import Papa from "papaparse";
import { SettingsContext } from "../context/SettingsContext";
import { Download, Upload } from "lucide-react";

// Components
import Layout from "../components/Layout";
import TaskForm from "../components/TaskForm";
import TaskItem from "../components/TaskItem";

const REMINDER_CHECK_INTERVAL_MS = 15000;
const REMINDER_MAX_LATE_MS = 24 * 60 * 60 * 1000;

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "40px",
    flexWrap: "wrap",
    gap: "16px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    margin: 0,
    background: "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  statsBadge: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#a75885",
    background: "rgba(167, 88, 133, 0.1)",
    padding: "6px 16px",
    borderRadius: "20px",
    border: "1px solid rgba(167, 88, 133, 0.2)",
    letterSpacing: "0.5px",
  },
  tabs: {
    display: "flex",
    gap: "12px",
    marginBottom: "32px",
    padding: "8px",
    background: "rgba(255,255,255,0.06)",
    borderRadius: "16px",
    boxShadow: "0 2px 8px rgba(167,88,133,0.04)",
  },
  tab: {
    border: "none",
    padding: "10px 28px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "700",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    textTransform: "capitalize",
    outline: "none",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    boxShadow: "0 1px 4px rgba(167,88,133,0.04)",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    marginTop: "12px",
  },
  emptyState: {
    textAlign: "center",
    padding: "80px 24px",
    background: "rgba(255,255,255,0.04)",
    borderRadius: "32px",
    border: "2px dashed rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.5)",
    fontSize: "16px",
    boxShadow: "0 2px 8px rgba(167,88,133,0.04)",
  },
  csvActions: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "16px",
  },
  csvButtonPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #a75885, #8f3a76)",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontWeight: "700",
    boxShadow: "0 4px 12px rgba(167, 88, 133, 0.2)",
  },
  csvButtonSecondary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.12)",
    cursor: "pointer",
    fontWeight: "700",
  },
  fileNameChip: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.8)",
    fontSize: "13px",
    maxWidth: "260px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  hiddenFileInput: {
    display: "none",
  },
};

const parseDueDate = (rawDueDate) => {
  if (!rawDueDate) return null;

  if (rawDueDate instanceof Date) {
    return Number.isNaN(rawDueDate.getTime()) ? null : rawDueDate;
  }

  if (typeof rawDueDate.toDate === "function") {
    const convertedDate = rawDueDate.toDate();
    return Number.isNaN(convertedDate.getTime()) ? null : convertedDate;
  }

  if (typeof rawDueDate.seconds === "number") {
    const convertedDate = new Date(rawDueDate.seconds * 1000);
    return Number.isNaN(convertedDate.getTime()) ? null : convertedDate;
  }

  const parsedDate = new Date(rawDueDate);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const parseDueTime = (rawTime) => {
  if (!rawTime || typeof rawTime !== "string") return null;

  const match = rawTime.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!match) return null;

  return { hours: Number(match[1]), minutes: Number(match[2]) };
};

const getReminderDateTime = (task) => {
  const dueDate = parseDueDate(task.dueDate);
  const dueTime = parseDueTime(task.dueTime || task.reminderTime);

  if (!dueDate || !dueTime) return null;

  const reminderDate = new Date(dueDate);
  reminderDate.setHours(dueTime.hours, dueTime.minutes, 0, 0);

  return Number.isNaN(reminderDate.getTime()) ? null : reminderDate;
};

const formatTimeLabel = (rawTime) => {
  const parsed = parseDueTime(rawTime);
  if (!parsed) return null;

  const hours12 = parsed.hours % 12 || 12;
  const meridiem = parsed.hours >= 12 ? "PM" : "AM";
  const minutes = parsed.minutes.toString().padStart(2, "0");
  return `${hours12}:${minutes} ${meridiem}`;
};

const getReminderStorageKey = (taskId, reminderDateTime) =>
  `tma:task-reminder:${taskId}:${reminderDateTime.getTime()}`;

// Notification UI
const Notification = ({ message }) => message ? (
  <div style={{ position: "fixed", top: 20, right: 20, background: "#a75885", color: "#fff", padding: "12px 24px", borderRadius: "8px", zIndex: 9999, fontWeight: 600 }}>
    {message}
  </div>
) : null;

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [notification, setNotification] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const fileInputRef = useRef(null);
  const notificationPermissionRequestedRef = useRef(false);
  const settings = useContext(SettingsContext);

  useEffect(() => {
    let unsubscribeTasks = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeTasks) {
        unsubscribeTasks();
        unsubscribeTasks = null;
      }

      if (user) {
        unsubscribeTasks = fetchTasksFromDB(user.uid, setTasks);
      } else {
        setTasks([]);
      }
    });

    return () => {
      if (unsubscribeTasks) unsubscribeTasks();
      unsubscribeAuth();
    };
  }, []);

  const ensureNotificationPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "default") return;
    if (notificationPermissionRequestedRef.current) return;

    notificationPermissionRequestedRef.current = true;

    try {
      await Notification.requestPermission();
    } catch {
      // Ignore browser-level permission request errors.
    }
  };

  const handleAddTask = async (taskData) => {
    const user = auth.currentUser;
    if (!user) return;

    if (taskData.dueDate && taskData.dueTime) {
      void ensureNotificationPermission();
    }

    await addTaskToDB(user.uid, taskData);
  };

  // CSV Import
  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFileName(file.name);

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const importedTasks = results.data;
        for (const t of importedTasks) {
          const parsedDueDate = parseDueDate(t.dueDate);
          const parsedDueTime =
            typeof t.dueTime === "string"
              ? t.dueTime
              : typeof t.reminderTime === "string"
                ? t.reminderTime
                : null;

          await handleAddTask({
            text: t.text,
            priority: t.priority || "medium",
            category: t.category || "personal",
            dueDate: parsedDueDate || null,
            dueTime: parsedDueTime,
            reminderTime: parsedDueTime,
            status: t.status || "todo",
          });
        }
        setNotification("Tasks imported successfully!");
        setTimeout(() => setNotification(""), 3000);
        e.target.value = "";
      },
      error: () => {
        setNotification("Failed to import tasks.");
        setTimeout(() => setNotification(""), 3000);
        e.target.value = "";
      }
    });
  };

  const handleExportCSV = () => {
    const csv = Papa.unparse(tasks);
    const link = document.createElement("a");
    link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    link.download = "tasks.csv";
    link.click();
  };

  const openImportDialog = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const fireTaskReminder = (task, reminderDateTime) => {
      const reminderKey = getReminderStorageKey(task.id, reminderDateTime);

      if (localStorage.getItem(reminderKey) === "1") return;

      if ("Notification" in window && Notification.permission === "granted") {
        const dueTimeLabel = formatTimeLabel(task.dueTime || task.reminderTime);

        new Notification("Task Reminder", {
          body: `${task.text} is due now${dueTimeLabel ? ` at ${dueTimeLabel}` : ""}.`,
          icon: "/favicon.ico",
          tag: reminderKey,
        });
      }

      localStorage.setItem(reminderKey, "1");
      setNotification(`Reminder: "${task.text}" is due now.`);
      window.setTimeout(() => setNotification(""), 4000);
    };

    const evaluateTaskReminders = () => {
      const now = Date.now();

      tasks.forEach((task) => {
        if (task.completed || task.status === "done") return;

        const reminderDateTime = getReminderDateTime(task);
        if (!reminderDateTime) return;

        const reminderMs = reminderDateTime.getTime();
        if (Number.isNaN(reminderMs)) return;

        const reminderKey = getReminderStorageKey(task.id, reminderDateTime);
        if (localStorage.getItem(reminderKey) === "1") return;

        if (reminderMs <= now) {
          if (now - reminderMs > REMINDER_MAX_LATE_MS) {
            localStorage.setItem(reminderKey, "1");
            return;
          }

          fireTaskReminder(task, reminderDateTime);
        }
      });
    };

    evaluateTaskReminders();
    const reminderInterval = window.setInterval(evaluateTaskReminders, REMINDER_CHECK_INTERVAL_MS);

    return () => {
      window.clearInterval(reminderInterval);
    };
  }, [tasks]);

  const handleToggleTask = (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    updateTaskInDB(id, { completed: !task.completed });
  };

  const handleDeleteTask = (id) => {
    if (window.confirm("Delete this task?")) {
      deleteTaskFromDB(id);
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const handleUpdateTask = (id, data) => {
    updateTaskInDB(id, data);
  };

  // Filter Logic
  const filteredTasks = tasks.filter((task) => {
    if (settings.hideCompleted && task.completed) return false;
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true; // "all"
  });

  const tasksLeft = tasks.filter((t) => !t.completed).length;

  return (
    <Layout>
      <div style={styles.header}>
        <h1 style={styles.title}>Dashboard</h1>
        <div style={styles.statsBadge}>
          {tasksLeft} {tasksLeft === 1 ? 'Task' : 'Tasks'} Remaining
        </div>
      </div>

      {/* CSV Import/Export Buttons */}
      <div style={styles.csvActions}>
        <button onClick={handleExportCSV} aria-label="Export tasks as CSV" style={styles.csvButtonPrimary}>
          <Download size={16} aria-hidden="true" />
          <span>Export CSV</span>
        </button>

        <button type="button" onClick={openImportDialog} style={styles.csvButtonSecondary} aria-label="Choose a CSV file to import">
          <Upload size={16} aria-hidden="true" />
          <span>Choose CSV File</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleImportCSV}
          aria-label="Import tasks from CSV"
          style={styles.hiddenFileInput}
        />

        {selectedFileName ? (
          <span style={styles.fileNameChip} title={selectedFileName}>
            {selectedFileName}
          </span>
        ) : null}
      </div>

      <Notification message={notification} />
      <TaskForm onAdd={handleAddTask} />

      {/* Filter Tabs */}
      <div style={styles.tabs} role="tablist" aria-label="Task filter tabs">
        {["all", "active", "completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              ...styles.tab,
              background: filter === f ? "rgba(255,255,255,0.1)" : "transparent",
              color: filter === f ? "#fff" : "rgba(255,255,255,0.5)",
            }}
            role="tab"
            aria-selected={filter === f}
            tabIndex={filter === f ? 0 : -1}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filteredTasks.length === 0 ? (
        <div style={styles.emptyState}>
          <p>No tasks found.</p>
        </div>
      ) : (
        <div style={styles.list}>
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
              onUpdate={handleUpdateTask}
            />
          ))}
        </div>
      )}
    </Layout>
  );
}

export default Dashboard;


