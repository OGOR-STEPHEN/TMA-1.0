import { useState, useEffect, useContext } from "react";
import { signupUser } from "../firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { SettingsContext } from "../context/SettingsContext";

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, rgba(15,23,42,0.72), rgba(8,12,20,0.72))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Inter, system-ui, sans-serif",
    color: "#E6EEF3",
  },

  card: {
    width: "100%",
    maxWidth: "420px",
    background: "rgba(0, 0, 0, 0.35)",
    backdropFilter: "blur(8px)",
    padding: "32px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.03)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
  },

  title: {
    fontSize: "24px",
    fontWeight: "600",
    marginBottom: "6px",
  },

  subtitle: {
    fontSize: "14px",
    opacity: 0.85,
    marginBottom: "24px",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  input: {
    padding: "14px 16px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.04)",
    color: "#E6EEF3",
    fontSize: "14px",
    outline: "none",
  },

  primaryButton: {
    marginTop: "10px",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    color: "#FFFFFF",
    background: "linear-gradient(135deg, #A75885, #8F3A76)",
    boxShadow: "0 10px 28px rgba(167,88,133,0.28)",
  },

  error: {
    fontSize: "13px",
    color: "#E6F7FF",
    opacity: 0.85,
  },

  footerText: {
    marginTop: "18px",
    fontSize: "13px",
    opacity: 0.85,
    textAlign: "center",
  },

  link: {
    color: "#E6F7FF",
    fontWeight: "600",
    textDecoration: "none",
  },
};

const getStyles = (theme) => {
  if (!theme) return styles;

  return {
    page: {
      minHeight: "100vh",
      background: theme.background,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Inter, system-ui, sans-serif",
      color: theme.text,
    },
    card: {
      width: "100%",
      maxWidth: "420px",
      background: theme.cardBackground,
      backdropFilter: theme.backdropFilter,
      padding: "32px",
      borderRadius: "14px",
      border: `1px solid ${theme.border}`,
      boxShadow: theme.shadow,
    },
    title: {
      fontSize: "24px",
      fontWeight: "600",
      marginBottom: "6px",
      color: theme.text,
    },
    subtitle: {
      fontSize: "14px",
      opacity: 0.85,
      marginBottom: "24px",
      color: theme.text,
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "14px",
    },
    input: {
      padding: "14px 16px",
      borderRadius: "12px",
      background: theme.inputBackground,
      border: `1px solid ${theme.border}`,
      color: theme.text,
      fontSize: "14px",
      outline: "none",
    },
    primaryButton: {
      marginTop: "10px",
      padding: "14px",
      borderRadius: "12px",
      border: "none",
      cursor: "pointer",
      fontWeight: "600",
      color: "#FFFFFF",
      background: "linear-gradient(135deg, #A75885, #8F3A76)",
      boxShadow: "0 10px 28px rgba(167,88,133,0.28)",
    },
    error: {
      fontSize: "13px",
      color: "#E6F7FF",
      opacity: 0.85,
    },
    footerText: {
      marginTop: "18px",
      fontSize: "13px",
      opacity: 0.85,
      textAlign: "center",
      color: theme.text,
    },
    link: {
      color: theme.text,
      fontWeight: "600",
      textDecoration: "none",
    },
  };
};

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const contextValue = useContext(SettingsContext);
  const { theme: themeObj } = contextValue || {};

  useEffect(() => {
    if (themeObj) {
      document.body.style.background = themeObj.background;
      document.body.style.backgroundAttachment = "fixed";
      document.body.style.backgroundSize = "cover";
      document.body.style.minHeight = "100vh";
      document.body.style.color = themeObj.text;
    }
  }, [themeObj]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");


    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await signupUser(email, password, name, username);
      console.log("User signed up successfully");
      navigate("/dashboard");
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message || "An error occurred during signup");
    }
  };

  return (
    <div style={getStyles(themeObj).page}>
      <div style={getStyles(themeObj).card}>
        <h1 style={getStyles(themeObj).title}>Create Account</h1>
        <p style={getStyles(themeObj).subtitle}>
          Set up your workspace and start organizing
        </p>

        <form onSubmit={handleSubmit} style={getStyles(themeObj).form}>
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={getStyles(themeObj).input}
          />

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={getStyles(themeObj).input}
          />

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={getStyles(themeObj).input}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={getStyles(themeObj).input}
          />

          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={getStyles(themeObj).input}
          />

          {error && <p style={getStyles(themeObj).error}>{error}</p>}

          <button type="submit" style={getStyles(themeObj).primaryButton}>
            Create Account
          </button>
        </form>

        <p style={getStyles(themeObj).footerText}>
          Already have an account?{" "}
          <Link to="/login" style={getStyles(themeObj).link}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;