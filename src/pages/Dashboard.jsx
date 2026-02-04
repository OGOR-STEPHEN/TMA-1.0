import { auth } from "../firebase/config";
import {
  addTaskToDB,
  fetchTasksFromDB,
  updateTaskInDB,
  deleteTaskFromDB,
} from "../firebase/tasks";
import { onAuthStateChanged } from "firebase/auth";
import { onSnapshot, collection, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";
import { useState, useEffect, useContext } from "react";
import TopBar from "../components/TopBar";
import { Trash2, Save, Edit, Check } from "lucide-react";
import { SettingsContext } from "../context/SettingsContext";

const Dashboard = () => {
  // console.log("USER:", auth.currentUser);
  const contextValue = useContext(SettingsContext);
  const { settings = { hideCompleted: false }, theme } = contextValue || {};
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredTasks = tasks.filter((task) => {
    if (settings.hideCompleted && task.completed) return false;
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true; // "all"
  });


  useEffect(() => {
    if (theme) {
      document.body.style.background = theme.background;
      document.body.style.color = theme.text;
    }
  }, [theme]);

  // ensure the whole document body uses the same background as this page
  useEffect(() => {
    const prev = {
      background: document.body.style.background,
      backgroundAttachment: document.body.style.backgroundAttachment,
      backgroundSize: document.body.style.backgroundSize,
      color: document.body.style.color,
      minHeight: document.body.style.minHeight,
      overflow: document.body.style.overflow,
      htmlOverflow: document.documentElement.style.overflow,
      htmlHeight: document.documentElement.style.height,
      bodyHeight: document.body.style.height,
    };

    const pageBg = theme?.background || "linear-gradient(180deg, rgba(15,23,42,0.72), rgba(8,12,20,0.72))";
    const textColor = theme?.text || "#E6EEF3";
    
    document.documentElement.style.height = "100%";
    document.body.style.height = "100%";
    document.body.style.background = pageBg;
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.backgroundSize = "cover";
    document.body.style.color = textColor;
    document.body.style.minHeight = "100vh";
    // hide native scrollbars (vertical + horizontal)
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    // also hide scrollbar and overflow on root container (commonly #root)
    const rootEl = document.getElementById("root");
    const prevRoot = rootEl ? { overflow: rootEl.style.overflow, height: rootEl.style.height } : null;
    if (rootEl) {
      rootEl.style.overflow = "hidden";
      rootEl.style.height = "100%";
    }

    // inject small style to hide webkit scrollbars and ensure no scrolling
    const styleEl = document.createElement("style");
    styleEl.id = "dashboard-hide-scrollbars";
    styleEl.textContent = `html, body, #root { overflow: hidden !important; height: 100% !important; }
body::-webkit-scrollbar { display: none; width: 0; height: 0; }`;
    document.head.appendChild(styleEl);

    return () => {
      document.body.style.background = prev.background || "";
      document.body.style.backgroundAttachment = prev.backgroundAttachment || "";
      document.body.style.backgroundSize = prev.backgroundSize || "";
      document.body.style.color = prev.color || "";
      document.body.style.minHeight = prev.minHeight || "";
      document.body.style.overflow = prev.overflow || "";
      document.documentElement.style.overflow = prev.htmlOverflow || "";
      document.documentElement.style.height = prev.htmlHeight || "";
      document.body.style.height = prev.bodyHeight || "";
      if (rootEl && prevRoot) {
        rootEl.style.overflow = prevRoot.overflow || "";
        rootEl.style.height = prevRoot.height || "";
      }
      const existing = document.getElementById("dashboard-hide-scrollbars");
      if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
    };
  }, [theme]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setTasks([]);
        return;
      }

      const unsubscribeTasks = fetchTasksFromDB(user.uid, setTasks);

      // cleanup Firestore listener
      return () => unsubscribeTasks();
    });

    // cleanup auth listener
    return () => unsubscribeAuth();
  }, []);


    // ADD TASK FUNCTION
  const addTask = async () => {
    if (!input.trim()) return;

    const user = auth.currentUser;
    if (!user) return;

    const id = await addTaskToDB(user.uid, input);

    setTasks((prev) => [
      ...prev,
      {
        id,
        text: input,
        completed: false,
      },
    ]);

    setInput("");
  };



  // TOGGLE TASK COMPLETION
    const toggleTask = (id) => {
      const user = auth.currentUser;
      if (!user) return;

      setTasks((prev) =>
        prev.map((task) => {
          if (task.id === id) {
            updateTaskInDB(user.uid, id, {
              completed: !task.completed,
            });
            return { ...task, completed: !task.completed };
          }
          return task;
        })
      );
    };


  // DELETE TASK FUNCTION
  const deleteTask = async (id) => {
    await deleteTaskFromDB(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };


  // EDIT TASK FUNCTIONS
  const startEdit = (task) => {
    setEditingId(task.id);
    setEditingText(task.text);
  };

  //  SAVE EDIT FUNCTION
  const saveEdit = async (id) => {
    await updateTaskInDB(id, { text: editingText });

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text: editingText } : t))
    );

    setEditingId(null);
    setEditingText("");
  };


  // MARK TASK AS DONE FUNCTION
  const markDone = async (id) => {
    await updateTaskInDB(id, { completed: true });

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: true } : t))
    );
  };

  // CLEAR ALL TASKS FUNCTION
  const clearAllTasks = async () => {
  const user = auth.currentUser;
  if (!user || tasks.length === 0) return;

  const confirmClear = window.confirm(
    "This will delete all your tasks. Continue?"
  );

  if (!confirmClear) return;

  for (const task of tasks) {
    await deleteTaskFromDB(task.id);
  }

  setTasks([]);
};



  const tasksLeft = tasks.filter((t) => !t.completed).length;

  return (
    <div style={styles.page}>
      <TopBar />

      {/* Add Task Card */}
    <div style={styles.card}>
      <h3>Add New Task</h3>

      <div style={styles.addRow}>
      <input
        autoFocus
        type="text"
        placeholder="Add a task..."
        style={styles.input}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addTask();
          }

          if ((e.metaKey || e.ctrlKey) && e.key === "Backspace") {
            e.preventDefault();
            setInput("");
          }
        }}
      />

        <button style={styles.addButton} onClick={addTask}>
          + Add
        </button>
      </div>
    </div>

      {/** Filter Buttons */}
      <div style={styles.filterBar}>
        <button
          style={{
            ...styles.filterButton,
            ...(filter === "all" ? styles.filterButtonActive : {}),
          }}
          onClick={() => setFilter("all")}
        >
          All
        </button>

        <button
          style={{
            ...styles.filterButton,
            ...(filter === "active" ? styles.filterButtonActive : {}),
          }}
          onClick={() => setFilter("active")}
        >
          Active
        </button>

        <button
          style={{
            ...styles.filterButton,
            ...(filter === "completed" ? styles.filterButtonActive : {}),
            ...(settings.hideCompleted ? styles.filterButtonDisabled : {}),
          }}
          onClick={() => !settings.hideCompleted && setFilter("completed")}
          disabled={settings.hideCompleted}
          title={settings.hideCompleted ? "Completed tasks are hidden" : ""}
        >
          Completed
        </button>
      </div>



      {/* Task List Card */}
      <div style={styles.card}>
        {tasks.length === 0 && <p>No tasks yet</p>}

        {filteredTasks.map((task) => (
          <div
            key={task.id}
            style={{
              ...styles.taskItem,
              opacity: task.completed ? 0.6 : 1,
            }}
          >
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => toggleTask(task.id)}
          />

          {editingId === task.id ? (
          <input
            value={editingText}
            autoFocus
            onChange={(e) => setEditingText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                saveEdit(task.id);
              }

              if (e.key === "Escape") {
                setEditingId(null);
                setEditingText("");
              }
            }}
            style={{ ...styles.input, marginRight: "12px" }}
          />

          ) : (
              <span
                style={{
                  textDecoration: task.completed ? "line-through" : "none",
                  flex: 1,
                }}
              >
                {task.text}
              </span>
            )}

            <div style={styles.actions}>
              {editingId === task.id ? (
                <button onClick={() => saveEdit(task.id)}><Save size={18} /></button>
              ) : (
                <button onClick={() => startEdit(task)}><Edit size={18} /></button>
              )}

              {!task.completed && (
                <button onClick={() => markDone(task.id)}><Check size={18} /></button>
              )}

              <button onClick={() => deleteTask(task.id)}><Trash2 size={18} /></button>
            </div>
          </div>
    ))}

      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <span>Tasks left: {tasksLeft}</span>

        <button
          style={styles.clearButton}
          onClick={clearAllTasks}
        >
          Clear All
        </button>
      </div>
    </div>
  );
};

const styles = {
  page: {
    maxWidth: "100%",
    margin: "0",
    padding: "48px 20px",
    fontFamily: "Arial, sans-serif",
    background: "transparent",
    height: "100%",
    maxHeight: "100vh",
    color: "inherit",
  },
filterBar: {
  display: "flex",
  gap: "10px",
  marginBottom: "16px",
},
filterButton: {
  padding: "8px 14px",
  borderRadius: "10px",
  border: "none",
  background: "rgba(255,255,255,0.04)",
  color: "#E6F7FF",
  cursor: "pointer",
  backdropFilter: "blur(8px)",
  transition: "all 0.2s ease",
},
filterButtonActive: {
  background: "linear-gradient(135deg, #a75885, #8f3a76)",
  color: "#fff",
  boxShadow: "0 12px 30px rgba(167,88,133,0.28)",
},
filterButtonDisabled: {
  opacity: 0.5,
  cursor: "not-allowed",
},

  card: {
    background: "rgba(0,0,0,0.35)",
    backdropFilter: "blur(8px)",
    borderRadius: "14px",
    padding: "22px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
    marginBottom: "28px",
    color: "inherit",
    border: "1px solid rgba(255,255,255,0.03)",
  },
  cardTitle: {
    marginBottom: "16px",
    fontSize: "20px",
    fontWeight: "600",
  },
  addRow: {
    display: "flex",
    gap: "14px",
  },
  input: {
    flex: 1,
    padding: "14px 16px",
    fontSize: "16px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.04)",
    background: "rgba(255,255,255,0.02)",
    color: "inherit",
    outline: "none",
  },

  addButton: {
    padding: "14px 26px",
    fontSize: "16px",
    fontWeight: "600",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    cursor: "pointer",

    background: "linear-gradient(135deg, #a75885, #8f3a76)",
    boxShadow: "0 10px 28px rgba(167,88,133,0.28)",
  },
    clearButton: {
    padding: "8px 14px",
    borderRadius: "10px",
    border: "none",
    background: "#a75885",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 6px 14px rgba(239, 68, 68, 0.4)",
  },
  taskItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "10px 0",
    borderBottom: "1px solid rgba(255,255,255,0.03)",
    borderLeft: "4px solid rgba(255,255,255,0.02)",
  },
  actions: {
    display: "flex",
    gap: "8px",
  },
  footer: {
    background: "rgba(0,0,0,0.28)",
    padding: "14px",
    borderRadius: "12px",
    fontWeight: "700",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#E6F7FF",
  },
};

export default Dashboard;