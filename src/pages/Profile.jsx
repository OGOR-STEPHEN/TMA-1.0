import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut } from "lucide-react";
import { SettingsContext } from "../context/SettingsContext";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { logoutUser } from "../firebase/auth";

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const contextValue = useContext(SettingsContext);
  const { theme: themeObj } = contextValue || {};

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    username: "",
  });

  // Fetch user profile data from Firestore
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          console.log("User data from Firestore:", userData);
          setProfile({
            fullName: userData.fullName || "",
            email: userData.email || user.email || "",
            username: userData.username || "",
          });
        } else {
          console.log("No user document found in Firestore");
          // Fallback to Firebase auth data if no Firestore document
          setProfile({
            fullName: user.displayName || "",
            email: user.email || "",
            username: (user.displayName || "").toLowerCase().replace(/\s+/g, ""),
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Set background and theme
  useEffect(() => {
    if (themeObj) {
      document.body.style.background = themeObj.background;
      document.body.style.backgroundAttachment = "fixed";
      document.body.style.backgroundSize = "cover";
      document.body.style.minHeight = "100vh";
      document.body.style.color = themeObj.text;
    }
  }, [themeObj]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        fullName: profile.fullName,
        email: profile.email,
        username: profile.username,
        updatedAt: new Date(),
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      try {
        await logoutUser();
        navigate("/login");
      } catch (error) {
        console.error("Error logging out:", error);
      }
    }
  };

  if (loading) {
    return (
      <div style={getStyles(themeObj).page}>
        <div style={{ textAlign: "center", paddingTop: "100px", color: themeObj?.text || "#E6EEF3" }}>
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div style={getStyles(themeObj).page}>
      {/* Back Button */}
      <button
        style={getStyles(themeObj).backButton}
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <h1 style={getStyles(themeObj).title}>Profile</h1>

      {/* Personal Information Card */}
      <div style={getStyles(themeObj).card}>
        <div style={getStyles(themeObj).cardTitle}>Personal Information</div>

        <div style={getStyles(themeObj).infoRow}>
          <span style={getStyles(themeObj).infoLabel}>Full Name</span>
          {isEditing ? (
            <input
              name="fullName"
              value={profile.fullName}
              onChange={handleChange}
              style={getStyles(themeObj).input}
            />
          ) : (
            <span style={getStyles(themeObj).infoValue}>{profile.fullName}</span>
          )}
        </div>

        <div style={getStyles(themeObj).infoRow}>
          <span style={getStyles(themeObj).infoLabel}>Email Address</span>
          {isEditing ? (
            <input
              name="email"
              value={profile.email}
              onChange={handleChange}
              style={getStyles(themeObj).input}
            />
          ) : (
            <span style={getStyles(themeObj).infoValue}>{profile.email}</span>
          )}
        </div>

        <div style={getStyles(themeObj).infoRow}>
          <span style={getStyles(themeObj).infoLabel}>Username</span>
          {isEditing ? (
            <input
              name="username"
              value={profile.username}
              onChange={handleChange}
              style={getStyles(themeObj).input}
            />
          ) : (
            <span style={getStyles(themeObj).infoValue}>{profile.username}</span>
          )}
        </div>

        <div style={getStyles(themeObj).actionRow}>
          {!isEditing ? (
            <button
              style={getStyles(themeObj).secondaryButton}
              onClick={() => setIsEditing(true)}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = themeObj?.buttonBackground
                  ? `${themeObj.buttonBackground}99`
                  : "rgba(255,255,255,0.08)";
                e.currentTarget.style.color = "#A75885";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  themeObj?.buttonBackground || "rgba(255,255,255,0.04)";
                e.currentTarget.style.color = themeObj?.text || "#E6F7FF";
              }}
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                style={getStyles(themeObj).secondaryButton}
                onClick={() => setIsEditing(false)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = themeObj?.buttonBackground
                    ? `${themeObj.buttonBackground}99`
                    : "rgba(255,255,255,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    themeObj?.buttonBackground || "rgba(255,255,255,0.04)";
                }}
              >
                Cancel
              </button>
              <button
                style={{
                  ...getStyles(themeObj).primaryButton,
                  opacity: isSaving ? 0.6 : 1,
                }}
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Account Card */}
      <div style={getStyles(themeObj).card}>
        <div style={getStyles(themeObj).cardTitle}>Account</div>

        <div style={getStyles(themeObj).accountSection}>
          <div>
            <div style={getStyles(themeObj).logoutLabel}>Log Out</div>
            <div style={getStyles(themeObj).logoutHint}>
              You will be redirected to the login page
            </div>
          </div>
          <button
            style={getStyles(themeObj).logoutButton}
            onClick={handleLogout}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "rgba(239, 68, 68, 0.15)";
              e.currentTarget.style.color = "#EF4444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "rgba(239, 68, 68, 0.1)";
              e.currentTarget.style.color = themeObj?.textSecondary || "#B6C2CF";
            }}
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "48px 20px",
    minHeight: "100vh",
  },
  backButton: {
    background: "none",
    border: "none",
    color: "#E6F7FF",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    opacity: 0.8,
    transition: "all 0.2s ease",
    marginBottom: "24px",
    padding: 0,
    fontSize: "14px",
    fontWeight: 500,
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
    marginBottom: "24px",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: 600,
    marginBottom: "24px",
    color: "#E6EEF3",
    paddingBottom: "16px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 0",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  infoLabel: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#B6C2CF",
  },
  infoValue: {
    fontSize: "14px",
    color: "#E6EEF3",
    fontWeight: 500,
  },
  input: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    color: "#E6EEF3",
    fontSize: "14px",
    fontFamily: "inherit",
    transition: "all 0.2s ease",
  },
  actionRow: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
    marginTop: "24px",
    paddingTop: "16px",
    borderTop: "1px solid rgba(255,255,255,0.05)",
  },
  primaryButton: {
    padding: "10px 20px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    color: "#fff",
    background: "linear-gradient(135deg, #A75885, #8F3A76)",
    boxShadow: "0 10px 28px rgba(167,88,133,0.28)",
    transition: "all 0.2s ease",
    fontSize: "14px",
  },
  secondaryButton: {
    padding: "10px 20px",
    borderRadius: "10px",
    border: "none",
    background: "rgba(255,255,255,0.04)",
    color: "#E6F7FF",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: "14px",
    fontWeight: 500,
  },
  accountSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
  },
  logoutLabel: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#E6EEF3",
    marginBottom: "4px",
  },
  logoutHint: {
    fontSize: "13px",
    opacity: 0.65,
    color: "#A0AEC0",
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 14px",
    borderRadius: "10px",
    border: "none",
    background: "rgba(239, 68, 68, 0.1)",
    color: "#B6C2CF",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: "14px",
    fontWeight: 500,
  },
};

const getStyles = (theme) => {
  if (!theme) return styles;

  return {
    page: {
      maxWidth: "900px",
      margin: "0 auto",
      padding: "48px 20px",
      minHeight: "100vh",
      color: theme.text,
    },
    backButton: {
      background: "none",
      border: "none",
      color: theme.text,
      display: "flex",
      alignItems: "center",
      gap: "8px",
      cursor: "pointer",
      opacity: 0.8,
      transition: "all 0.2s ease",
      marginBottom: "24px",
      padding: 0,
      fontSize: "14px",
      fontWeight: 500,
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
      marginBottom: "24px",
    },
    cardTitle: {
      fontSize: "18px",
      fontWeight: 600,
      marginBottom: "24px",
      color: theme.text,
      paddingBottom: "16px",
      borderBottom: `1px solid ${theme.border}`,
    },
    infoRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "16px 0",
      borderBottom: `1px solid ${theme.border}`,
    },
    infoLabel: {
      fontSize: "14px",
      fontWeight: 500,
      color: theme.textSecondary,
    },
    infoValue: {
      fontSize: "14px",
      color: theme.text,
      fontWeight: 500,
    },
    input: {
      padding: "8px 12px",
      borderRadius: "8px",
      border: `1px solid ${theme.border}`,
      background: theme.inputBackground,
      color: theme.text,
      fontSize: "14px",
      fontFamily: "inherit",
      transition: "all 0.2s ease",
    },
    actionRow: {
      display: "flex",
      gap: "12px",
      justifyContent: "flex-end",
      marginTop: "24px",
      paddingTop: "16px",
      borderTop: `1px solid ${theme.border}`,
    },
    primaryButton: {
      padding: "10px 20px",
      borderRadius: "10px",
      border: "none",
      cursor: "pointer",
      fontWeight: 600,
      color: "#fff",
      background: "linear-gradient(135deg, #A75885, #8F3A76)",
      boxShadow: "0 10px 28px rgba(167,88,133,0.28)",
      transition: "all 0.2s ease",
      fontSize: "14px",
    },
    secondaryButton: {
      padding: "10px 20px",
      borderRadius: "10px",
      border: "none",
      background: theme.buttonBackground,
      color: theme.text,
      cursor: "pointer",
      transition: "all 0.2s ease",
      fontSize: "14px",
      fontWeight: 500,
    },
    accountSection: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 0",
    },
    logoutLabel: {
      fontSize: "14px",
      fontWeight: 500,
      color: theme.text,
      marginBottom: "4px",
    },
    logoutHint: {
      fontSize: "13px",
      opacity: 0.65,
      color: theme.textMuted,
    },
    logoutButton: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 14px",
      borderRadius: "10px",
      border: "none",
      background: "rgba(239, 68, 68, 0.1)",
      color: theme.textSecondary,
      cursor: "pointer",
      transition: "all 0.2s ease",
      fontSize: "14px",
      fontWeight: 500,
    },
  };
};

export default Profile;