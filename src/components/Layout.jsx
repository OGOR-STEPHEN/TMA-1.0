import React, { useContext } from "react";
import Sidebar from "./Sidebar";
import { SettingsContext } from "../context/SettingsContext";

const Layout = ({ children }) => {
    const { theme } = useContext(SettingsContext);

    const pageBg =
        theme?.background ||
        "linear-gradient(180deg, rgba(15,23,42,1), rgba(8,12,20,1))";
    const textColor = theme?.text || "#E6EEF3";

    return (
        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                background: pageBg,
                color: textColor,
            }}
        >
            <Sidebar />
            <main style={styles.mainContent}>{children}</main>
        </div>
    );
};

const styles = {
    mainContent: {
        flex: 1,
        marginLeft: "250px", // Sidebar width
        padding: "40px",
        overflowY: "auto",
        height: "100vh",
    },
};

export default Layout;
