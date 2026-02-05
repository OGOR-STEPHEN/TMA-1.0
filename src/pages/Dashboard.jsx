import { auth } from "../firebase/config";
import {
  addTaskToDB,
  fetchTasksFromDB,
  updateTaskInDB,
  deleteTaskFromDB,
} from "../firebase/tasks";
import { onAuthStateChanged } from "firebase/auth";
import { useState, useEffect, useContext } from "react";
import { SettingsContext } from "../context/SettingsContext";

// Components
import Layout from "../components/Layout";
import TaskForm from "../components/TaskForm";
import TaskItem from "../components/TaskItem";

const Dashboard = () => {
  const contextValue = useContext(SettingsContext);
  const { settings = { hideCompleted: false } } = contextValue || {};

  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setTasks([]);
        return;
      }
      const unsubscribeTasks = fetchTasksFromDB(user.uid, setTasks);
      return () => unsubscribeTasks();
    });
    return () => unsubscribeAuth();
  }, []);

  // Handlers
  const handleAddTask = async (taskData) => {
    const user = auth.currentUser;
    if (!user) return;
    await addTaskToDB(user.uid, taskData);

    // Check for reminder immediately (simple check)
    if (taskData.reminderTime && Notification.permission === "granted") {
      new Notification("Task Created", { body: `Reminder set for: ${taskData.text}` });
    } else if (taskData.reminderTime && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  };

  const handleToggleTask = (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    updateTaskInDB(id, { completed: !task.completed }); // Legacy & new compat
  };

  const handleDeleteTask = (id) => {
    if (window.confirm("Delete this task?")) {
      deleteTaskFromDB(id);
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
        <h1>My Tasks</h1>
        <div style={styles.stats}>
          <span>{tasksLeft} tasks left</span>
        </div>
      </div>

      <TaskForm onAdd={handleAddTask} />

      {/* Filter Tabs */}
      <div style={styles.tabs}>
        {["all", "active", "completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              ...styles.tab,
              background: filter === f ? "rgba(255,255,255,0.1)" : "transparent",
              color: filter === f ? "#fff" : "rgba(255,255,255,0.5)",
            }}
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
};

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },
  stats: {
    fontSize: "14px",
    opacity: 0.7,
  },
  tabs: {
    display: "flex",
    gap: "5px",
    marginBottom: "20px",
    paddingBottom: "10px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  tab: {
    border: "none",
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s",
  },
  list: {
    display: "flex",
    flexDirection: "column",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px",
    opacity: 0.5,
  }
};

export default Dashboard;
