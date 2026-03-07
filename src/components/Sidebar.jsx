import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    KanbanSquare,
    CheckCircle2,
    Timer,
    BarChart3,
    Settings,
    User,
    LogOut
} from "lucide-react";
import { auth } from "../firebase/config";

const Sidebar = () => {
    const location = useLocation();

    const handleLogout = () => {
        auth.signOut();
    };

    const navItems = [
        { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { label: "Board", path: "/board", icon: KanbanSquare },
        { label: "Focus", path: "/focus", icon: Timer },
        { label: "Reports", path: "/reports", icon: BarChart3 },
        { label: "Profile", path: "/profile", icon: User },
        { label: "Settings", path: "/settings", icon: Settings },
    ];

    return (
        <div style={styles.sidebar}>
            <div style={styles.logoContainer}>
                <h2 style={styles.logo}>TMA 1.0</h2>
            </div>

            <nav style={styles.nav} aria-label="Main navigation">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            style={{
                                ...styles.link,
                                ...(isActive ? styles.activeLink : {}),
                            }}
                            aria-current={isActive ? "page" : undefined}
                            tabIndex={0}
                        >
                            <Icon size={20} aria-hidden="true" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div style={styles.footer}>
                <button onClick={handleLogout} style={styles.logoutButton} aria-label="Logout" tabIndex={0}>
                    <LogOut size={20} aria-hidden="true" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

const styles = {
    sidebar: {
        width: "250px",
        height: "100vh",
        background: "rgba(0, 0, 0, 0.45)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255, 255, 255, 0.05)",
        display: "flex",
        flexDirection: "column",
        padding: "30px 20px",
        position: "fixed",
        left: 0,
        top: 0,
        color: "#E6F7FF",
        zIndex: 1000,
        transition: "transform 0.3s ease",
    },
    logoContainer: {
        marginBottom: "40px",
        paddingLeft: "10px",
    },
    logo: {
        margin: 0,
        background: "linear-gradient(135deg, #a75885, #8f3a76)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        fontSize: "24px",
        fontWeight: "bold",
    },
    nav: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        flex: 1,
    },
    link: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px 16px",
        color: "rgba(255, 255, 255, 0.6)",
        textDecoration: "none",
        borderRadius: "12px",
        transition: "all 0.2s ease",
        fontSize: "15px",
        fontWeight: "500",
    },
    activeLink: {
        background: "rgba(167, 88, 133, 0.2)",
        color: "#fff",
        borderLeft: "3px solid #a75885",
    },
    footer: {
        paddingTop: "20px",
        borderTop: "1px solid rgba(255, 255, 255, 0.05)",
    },
    logoutButton: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        width: "100%",
        padding: "12px 16px",
        background: "transparent",
        border: "none",
        color: "rgba(255, 255, 255, 0.6)",
        fontSize: "15px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "color 0.2s",
        textAlign: "left",
    },
};

export default Sidebar;
