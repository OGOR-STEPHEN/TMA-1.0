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
            <div className="mobile-hide">
                <Sidebar />
            </div>
            <main style={styles.mainContent}>
                <div style={styles.container}>
                    {children}
                </div>
            </main>

            <style>{`
                @media (max-width: 768px) {
                    main { 
                        margin-left: 0 !important;
                        padding: 20px !important;
                    }
                    .mobile-hide { display: none !important; }
                }
            `}</style>
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
        display: "flex",
        justifyContent: "center",
    },
    container: {
        width: "100%",
        maxWidth: "1000px",
    }
};

export default Layout;
