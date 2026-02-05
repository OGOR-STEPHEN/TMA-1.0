import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Play, Pause, RotateCcw } from "lucide-react";

const Focus = () => {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState("focus"); // focus (25), short (5), long (15)

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            new Notification("Time's up!", { body: "Take a break!" });
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        if (mode === "focus") setTimeLeft(25 * 60);
        if (mode === "short") setTimeLeft(5 * 60);
        if (mode === "long") setTimeLeft(15 * 60);
    };

    const setTimerMode = (m) => {
        setMode(m);
        setIsActive(false);
        if (m === "focus") setTimeLeft(25 * 60);
        if (m === "short") setTimeLeft(5 * 60);
        if (m === "long") setTimeLeft(15 * 60);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const percentage = (timeLeft / (mode === "focus" ? 1500 : mode === "short" ? 300 : 900)) * 100;

    return (
        <Layout>
            <div style={styles.container}>
                <div style={styles.modes}>
                    <button style={mode === "focus" ? styles.activeMode : styles.mode} onClick={() => setTimerMode("focus")}>Focus</button>
                    <button style={mode === "short" ? styles.activeMode : styles.mode} onClick={() => setTimerMode("short")}>Short Break</button>
                    <button style={mode === "long" ? styles.activeMode : styles.mode} onClick={() => setTimerMode("long")}>Long Break</button>
                </div>

                <div style={styles.timerWrapper}>
                    <CircularProgressbar
                        value={percentage}
                        text={formatTime(timeLeft)}
                        styles={buildStyles({
                            textColor: "#fff",
                            pathColor: mode === "focus" ? "#a75885" : "#10b981",
                            trailColor: "rgba(255,255,255,0.1)",
                            textSize: "24px"
                        })}
                    />
                </div>

                <div style={styles.controls}>
                    <button onClick={toggleTimer} style={styles.mainBtn}>
                        {isActive ? <Pause size={32} /> : <Play size={32} style={{ marginLeft: 4 }} />}
                    </button>
                    <button onClick={resetTimer} style={styles.resetBtn}>
                        <RotateCcw size={20} />
                    </button>
                </div>
            </div>
        </Layout>
    );
};

const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        maxWidth: "500px",
        margin: "0 auto"
    },
    modes: {
        display: "flex",
        gap: "10px",
        marginBottom: "40px",
        background: "rgba(255,255,255,0.05)",
        padding: "6px",
        borderRadius: "12px"
    },
    mode: {
        padding: "8px 16px",
        borderRadius: "8px",
        background: "transparent",
        border: "none",
        color: "rgba(255,255,255,0.6)",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "500"
    },
    activeMode: {
        padding: "8px 16px",
        borderRadius: "8px",
        background: "rgba(255,255,255,0.1)",
        border: "none",
        color: "#fff",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "600"
    },
    timerWrapper: {
        width: "300px",
        height: "300px",
        marginBottom: "40px"
    },
    controls: {
        display: "flex",
        alignItems: "center",
        gap: "20px"
    },
    mainBtn: {
        width: "80px",
        height: "80px",
        borderRadius: "40px",
        border: "none",
        background: "#fff",
        color: "#0f172a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: "0 0 20px rgba(255,255,255,0.2)"
    },
    resetBtn: {
        width: "50px",
        height: "50px",
        borderRadius: "25px",
        border: "none",
        background: "rgba(255,255,255,0.1)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer"
    }
};

export default Focus;
