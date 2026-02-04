import TopBar from "../components/TopBar";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { auth } from "../firebase/config";
import { deleteTaskFromDB, fetchTasksFromDB } from "../firebase/tasks";
import { SettingsContext } from "../context/SettingsContext";

const Settings = () => {
  const navigate = useNavigate();
  const contextValue = useContext(SettingsContext);
  const { settings = { theme: "dark", hideCompleted: false }, saveSettings = () => {}, theme: themeObj } = contextValue || {};

  useEffect(() => {
    if (themeObj) {
      document.body.style.background = themeObj.background;
      document.body.style.backgroundAttachment = "fixed";
      document.body.style.backgroundSize = "cover";
      document.body.style.minHeight = "100vh";
      document.body.style.color = themeObj.text;
    }
  }, [themeObj]);

  const [theme, setTheme] = useState(settings.theme || "dark");
  const [hideCompleted, setHideCompleted] = useState(settings.hideCompleted || false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);

    // Save to context
    await saveSettings({ theme, hideCompleted });

    setTimeout(() => {
      setSaving(false);
    }, 800);
  };

  const handleClearCompletedTasks = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const confirmClear = window.confirm(
      "This will delete all completed tasks. Continue?"
    );

    if (!confirmClear) return;

    setSaving(true);

    // Fetch current tasks to get completed ones
    const unsubscribe = fetchTasksFromDB(user.uid, async (tasks) => {
      const completedTasks = tasks.filter((task) => task.completed);

      // Delete each completed task
      for (const task of completedTasks) {
        await deleteTaskFromDB(task.id);
      }

      setSaving(false);
      unsubscribe();
    });
  };

  return (
    <div style={getStyles(themeObj).page}>
      <TopBar />
      <h2 style={getStyles(themeObj).title}>Settings</h2>

      <div style={getStyles(themeObj).card}>
        {/* Appearance */}
        <div style={getStyles(themeObj).section}>
          <div>
            <h4 style={getStyles(themeObj).sectionTitle}>Appearance</h4>
            <p style={getStyles(themeObj).muted}>Switch between light and dark themes</p>
          </div>

          <div style={getStyles(themeObj).toggleGroup}>
            <button
              style={{
                ...getStyles(themeObj).toggleButton,
                ...(theme === "light" ? getStyles(themeObj).toggleActive : {}),
              }}
              onClick={() => setTheme("light")}
            >
              Light
            </button>
            <button
              style={{
                ...getStyles(themeObj).toggleButton,
                ...(theme === "dark" ? getStyles(themeObj).toggleActive : {}),
              }}
              onClick={() => setTheme("dark")}
            >
              Dark
            </button>
          </div>
        </div>

        {/* Task Preferences */}
        <div style={getStyles(themeObj).section}>
          <div>
            <h4 style={getStyles(themeObj).sectionTitle}>Task Preferences</h4>
            <p style={getStyles(themeObj).muted}>Hide tasks you've already completed</p>
          </div>

          <button
            style={{
              ...getStyles(themeObj).sliderButton,
              background: hideCompleted
                ? "linear-gradient(135deg, #A75885, #8F3A76)"
                : themeObj?.buttonBackground || "rgba(255,255,255,0.08)",
            }}
            onClick={() => setHideCompleted(!hideCompleted)}
          >
            <span
              style={{
                ...getStyles(themeObj).sliderDot,
                transform: hideCompleted ? "translateX(20px)" : "translateX(0)",
              }}
            />
          </button>
        </div>

        {/* Data */}
        <div style={getStyles(themeObj).section}>
          <div>
            <h4 style={getStyles(themeObj).sectionTitle}>Data</h4>
            <p style={getStyles(themeObj).muted}>Manage your task history</p>
          </div>

          <button 
            style={getStyles(themeObj).secondaryButton}
            onClick={handleClearCompletedTasks}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, #A75885, #8F3A76)";
              e.currentTarget.style.boxShadow = "0 10px 28px rgba(167,88,133,0.28)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = themeObj?.buttonBackground || "rgba(255,255,255,0.04)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Clear completed tasks
          </button>
        </div>

        {/* Save */}
        <div style={getStyles(themeObj).saveRow}>
          <button
            style={{
              ...getStyles(themeObj).primaryButton,
              opacity: saving ? 0.6 : 1,
            }}
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>

      {/* Back */}
      <button style={getStyles(themeObj).backButton} onClick={() => navigate("/dashboard")}>
        <ArrowLeft size={16} />
        Back to dashboard
      </button>
    </div>
  );
};

const styles = {
  page: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "48px 20px",
    color: "#E6EEF3",
    minHeight: "100vh",
  },
  title: {
    fontSize: "28px",
    fontWeight: 700,
    marginBottom: "24px",
    color: "#E6EEF3",
  },
  card: {
    background: "rgba(0,0,0,0.35)",
    backdropFilter: "blur(10px)",
    borderRadius: "18px",
    padding: "32px",
    boxShadow: "0 18px 40px rgba(0,0,0,0.55)",
    border: "1px solid rgba(255,255,255,0.05)",
  },
  section: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 0",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  sectionTitle: {
    fontSize: "15px",
    fontWeight: 600,
    marginBottom: "4px",
    color: "#E6EEF3",
  },
  muted: {
    fontSize: "13px",
    opacity: 0.65,
    color: "#A0AEC0",
  },
  sliderButton: {
    width: "48px",
    height: "28px",
    borderRadius: "20px",
    border: "none",
    cursor: "pointer",
    position: "relative",
    padding: 0,
    transition: "background 0.3s ease",
  },
  sliderDot: {
    position: "absolute",
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    background: "#fff",
    top: "2px",
    left: "2px",
    transition: "transform 0.3s ease",
  },
  toggleGroup: {
    display: "flex",
    gap: "8px",
  },
  toggleButton: {
    padding: "8px 16px",
    borderRadius: "10px",
    border: "none",
    background: "rgba(255,255,255,0.04)",
    color: "#E6F7FF",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  toggleActive: {
    background: "linear-gradient(135deg, #A75885, #8F3A76)",
    boxShadow: "0 10px 28px rgba(167,88,133,0.28)",
    color: "#fff",
  },
  secondaryButton: {
    padding: "8px 14px",
    borderRadius: "10px",
    border: "none",
    background: "rgba(255,255,255,0.04)",
    color: "#E6F7FF",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  saveRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "24px",
  },
  primaryButton: {
    padding: "12px 24px",
    borderRadius: "14px",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    color: "#fff",
    background: "linear-gradient(135deg, #A75885, #8F3A76)",
    boxShadow: "0 10px 28px rgba(167,88,133,0.28)",
    transition: "all 0.2s ease",
  },
  backButton: {
    marginTop: "24px",
    background: "none",
    border: "none",
    color: "#E6F7FF",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    opacity: 0.8,
    transition: "all 0.2s ease",
  },
};

const getStyles = (theme) => {
  if (!theme) return styles;

  return {
    page: {
      maxWidth: "900px",
      margin: "0 auto",
      padding: "48px 20px",
      color: theme.text,
      minHeight: "100vh",
    },
    title: {
      fontSize: "28px",
      fontWeight: 700,
      marginBottom: "24px",
      color: theme.text,
    },
    card: {
      background: theme.cardBackground,
      backdropFilter: theme.backdropFilter,
      borderRadius: "18px",
      padding: "32px",
      boxShadow: theme.shadow,
      border: `1px solid ${theme.border}`,
    },
    section: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "20px 0",
      borderBottom: `1px solid ${theme.border}`,
    },
    sectionTitle: {
      fontSize: "15px",
      fontWeight: 600,
      marginBottom: "4px",
      color: theme.text,
    },
    muted: {
      fontSize: "13px",
      opacity: 0.65,
      color: theme.textMuted,
    },
    sliderButton: {
      width: "48px",
      height: "28px",
      borderRadius: "20px",
      border: "none",
      cursor: "pointer",
      position: "relative",
      padding: 0,
      transition: "background 0.3s ease",
    },
    sliderDot: {
      position: "absolute",
      width: "24px",
      height: "24px",
      borderRadius: "50%",
      background: theme.name === "dark" ? "#fff" : "#1F2937",
      top: "2px",
      left: "2px",
      transition: "transform 0.3s ease",
    },
    toggleGroup: {
      display: "flex",
      gap: "8px",
    },
    toggleButton: {
      padding: "8px 16px",
      borderRadius: "10px",
      border: "none",
      background: theme.buttonBackground,
      color: theme.text,
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    toggleActive: {
      background: "linear-gradient(135deg, #A75885, #8F3A76)",
      boxShadow: "0 10px 28px rgba(167,88,133,0.28)",
      color: "#fff",
    },
    secondaryButton: {
      padding: "8px 14px",
      borderRadius: "10px",
      border: "none",
      background: theme.buttonBackground,
      color: theme.text,
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    saveRow: {
      display: "flex",
      justifyContent: "flex-end",
      marginTop: "24px",
    },
    primaryButton: {
      padding: "12px 24px",
      borderRadius: "14px",
      border: "none",
      cursor: "pointer",
      fontWeight: 600,
      color: "#fff",
      background: "linear-gradient(135deg, #A75885, #8F3A76)",
      boxShadow: "0 10px 28px rgba(167,88,133,0.28)",
      transition: "all 0.2s ease",
    },
    backButton: {
      marginTop: "24px",
      background: "none",
      border: "none",
      color: theme.text,
      display: "flex",
      alignItems: "center",
      gap: "8px",
      cursor: "pointer",
      opacity: 0.8,
      transition: "all 0.2s ease",
    },
  };
};

export default Settings;