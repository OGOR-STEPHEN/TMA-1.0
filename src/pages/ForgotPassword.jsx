import { useState, useEffect, useContext } from "react";
import { resetPassword } from "../firebase/auth";
import { Link } from "react-router-dom";
import { SettingsContext } from "../context/SettingsContext";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
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
    setMessage("");
    setError("");

    const result = await resetPassword(email);

    if (result.success) {
      setMessage("Password reset email sent. Check your inbox.");
    } else {
      setError(result.message);
    }
  };

  return (
    <div style={getStyles(themeObj).page}>
      <div style={getStyles(themeObj).card}>
        <h1 style={getStyles(themeObj).title}>Reset your password</h1>
        <p style={getStyles(themeObj).subtitle}>
          Enter your email and we’ll send you a reset link
        </p>

        <form onSubmit={handleSubmit} style={getStyles(themeObj).form}>
          <label style={getStyles(themeObj).label}>Email</label>
          <input
            type="email"
            placeholder="Enter your email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={getStyles(themeObj).input}
          />

          <button type="submit" style={getStyles(themeObj).button}>
            Send Reset Link
          </button>
        </form>

        {message && <p style={getStyles(themeObj).success}>{message}</p>}
        {error && <p style={getStyles(themeObj).error}>{error}</p>}

        <Link to="/login" style={getStyles(themeObj).back}>
          ← Back to Login
        </Link>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "rgba(0,0,0,0.35)",
    backdropFilter: "blur(10px)",
    borderRadius: "18px",
    padding: "36px 32px",
    boxShadow: "0 18px 40px rgba(0,0,0,0.55)",
    border: "1px solid rgba(255,255,255,0.05)",
    textAlign: "center",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "6px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#B6C2CF",
    marginBottom: "26px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  label: {
    textAlign: "left",
    fontSize: "13px",
    fontWeight: "600",
    color: "#E6F7FF",
  },
  input: {
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(255,255,255,0.04)",
    color: "#E6EEF3",
    outline: "none",
    fontSize: "15px",
  },
  button: {
    marginTop: "8px",
    padding: "14px",
    borderRadius: "14px",
    border: "none",
    fontWeight: "700",
    fontSize: "16px",
    color: "#fff",
    cursor: "pointer",
    background: "linear-gradient(135deg, #a75885, #8f3a76)",
    boxShadow: "0 12px 30px rgba(167,88,133,0.35)",
  },
  success: {
    marginTop: "16px",
    fontSize: "13px",
    color: "#4ADE80",
  },
  error: {
    marginTop: "16px",
    fontSize: "13px",
    color: "#F87171",
  },
  back: {
    display: "inline-block",
    marginTop: "18px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#E6F7FF",
    textDecoration: "none",
  },
};

const getStyles = (theme) => {
  if (!theme) return styles;

  return {
    page: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    },
    card: {
      width: "100%",
      maxWidth: "420px",
      background: theme.cardBackground,
      backdropFilter: theme.backdropFilter,
      borderRadius: "18px",
      padding: "36px 32px",
      boxShadow: theme.shadow,
      border: `1px solid ${theme.border}`,
      textAlign: "center",
    },
    title: {
      fontSize: "24px",
      fontWeight: "700",
      marginBottom: "6px",
      color: theme.text,
    },
    subtitle: {
      fontSize: "14px",
      color: theme.textSecondary,
      marginBottom: "26px",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "14px",
    },
    label: {
      textAlign: "left",
      fontSize: "13px",
      fontWeight: "600",
      color: theme.text,
    },
    input: {
      padding: "14px 16px",
      borderRadius: "12px",
      border: `1px solid ${theme.border}`,
      background: theme.inputBackground,
      color: theme.text,
      outline: "none",
      fontSize: "15px",
    },
    button: {
      marginTop: "8px",
      padding: "14px",
      borderRadius: "14px",
      border: "none",
      fontWeight: "700",
      fontSize: "16px",
      color: "#fff",
      cursor: "pointer",
      background: "linear-gradient(135deg, #a75885, #8f3a76)",
      boxShadow: "0 12px 30px rgba(167,88,133,0.35)",
    },
    success: {
      marginTop: "16px",
      fontSize: "13px",
      color: "#4ADE80",
    },
    error: {
      marginTop: "16px",
      fontSize: "13px",
      color: "#F87171",
    },
    back: {
      display: "inline-block",
      marginTop: "18px",
      fontSize: "13px",
      fontWeight: "600",
      color: theme.text,
      textDecoration: "none",
    },
  };
};

export default ForgotPassword;