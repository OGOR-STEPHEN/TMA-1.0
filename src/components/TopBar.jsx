import { User, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { SettingsContext } from "../context/SettingsContext";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";


const TopBar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const contextValue = useContext(SettingsContext);
  const { theme } = contextValue || {};
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchUsername = async () => {
      if (!user) return;

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUsername(userData.username || "");
        }
      } catch (error) {
        console.error("Error fetching username:", error);
      }
    };

    fetchUsername();
  }, [user]);

  const getStyles = (themeObj) => {
    if (!themeObj) return styles;

    return {
      topBar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "32px",
      },
      title: {
        margin: 0,
        color: themeObj.text,
      },
      right: {
        display: "flex",
        gap: "12px",
        alignItems: "center",
      },
      icon: {
        fontSize: "18px",
        border: "none",
        background: "none",
        cursor: "pointer",
      },
      avatar: {
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        background: "#ddd",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
      iconButton: {
        width: "42px",
        height: "42px",
        borderRadius: "12px",
        border: `1px solid ${themeObj.border}`,
        background: themeObj.buttonBackground,
        color: themeObj.text,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        backdropFilter: themeObj.backdropFilter,
        transition: "all 0.2s ease",
      },
    };
  };

  const getHoverBackground = (themeObj) => {
    if (!themeObj) return "rgba(255,255,255,0.08)";
    // For light mode, use a slightly darker background on hover
    if (themeObj.name === "light") {
      return "rgba(0,0,0,0.08)";
    }
    // For dark mode, use a slightly lighter background on hover
    return "rgba(255,255,255,0.08)";
  };

  return (
    <header style={getStyles(theme).topBar}>
      <h2 style={getStyles(theme).title}>
        {username ? `Welcome, ${username}` : "Daily Task Tracker"}
      </h2>

      <div style={getStyles(theme).right}>
        <button style={getStyles(theme).iconButton}
          onClick={() => navigate("/settings")}
          title="Settings"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = getHoverBackground(theme);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = theme?.buttonBackground || "rgba(255,255,255,0.04)";
          }}
        >
          <Settings size={20} />
        </button>
        <button style={getStyles(theme).iconButton} title="Profile"
          onClick={() => navigate("/profile")}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = getHoverBackground(theme);
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = theme?.buttonBackground || "rgba(255,255,255,0.04)";
          }}
        >
          <User size={20} />
        </button>
      </div>
    </header>
  );
};

const styles = {
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
  },
  title: {
    margin: 0,
  },
  right: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  icon: {
    fontSize: "18px",
    border: "none",
    background: "none",
    cursor: "pointer",
  },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "#ddd",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
    iconButton: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(255,255,255,0.04)",
    color: "#E6F7FF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    backdropFilter: "blur(8px)",
    transition: "all 0.2s ease",
  },  
};

export default TopBar;
