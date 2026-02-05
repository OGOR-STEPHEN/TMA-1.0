import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Play, Pause, RotateCcw, Pencil, Check } from "lucide-react";

const Focus = () => {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState("focus"); // focus, short, long
    const [durations, setDurations] = useState({ focus: 25, short: 5, long: 15 }); // in minutes
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(25);

    useEffect(() => {
        if ("Notification" in window && Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            if (Notification.permission === "granted") {
                new Notification("Time's up!", {
                    body: `${mode === 'focus' ? 'Focus session' : 'Break'} complete!`,
                    icon: "/favicon.ico"
                });
            }
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, mode]);

    const toggleTimer = () => {
        if (!isActive && Notification.permission !== "granted") {
            Notification.requestPermission();
        }
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(durations[mode] * 60);
    };

    const setTimerMode = (m) => {
        setMode(m);
        setIsActive(false);
        setIsEditing(false);
        setEditValue(durations[m]);
        setTimeLeft(durations[m] * 60);
    };

    const handleEditSave = () => {
        const newMinutes = parseInt(editValue);
        if (!isNaN(newMinutes) && newMinutes > 0) {
            setDurations(prev => ({ ...prev, [mode]: newMinutes }));
            setTimeLeft(newMinutes * 60);
            setIsEditing(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const percentage = (timeLeft / (durations[mode] * 60)) * 100;

    return (
        <Layout>
            <div style={styles.container}>
                <div style={styles.modes}>
                    <button style={mode === "focus" ? styles.activeMode : styles.mode} onClick={() => setTimerMode("focus")}>Focus</button>
                    <button style={mode === "short" ? styles.activeMode : styles.mode} onClick={() => setTimerMode("short")}>Short Break</button>
                    <button style={mode === "long" ? styles.activeMode : styles.mode} onClick={() => setTimerMode("long")}>Long Break</button>
                </div>

                <div style={styles.timerWrapper}>
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                        <CircularProgressbar
                            value={percentage}
                            text={!isEditing ? formatTime(timeLeft) : ""}
                            styles={buildStyles({
                                textColor: "#fff",
                                pathColor: mode === "focus" ? "#a75885" : "#10b981",
                                trailColor: "rgba(255,255,255,0.1)",
                                textSize: "24px"
                            })}
                        />
                        {/* Edit Overlay */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column'
                        }}>
                            {isEditing ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <input
                                        type="number"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        style={styles.timeInput}
                                        autoFocus
                                    />
                                    <span style={{ fontSize: '20px', color: '#rgba(255,255,255,0.8)' }}>min</span>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {/* Floating Edit Button if not editing */}
                    {!isEditing && !isActive && (
                        <button onClick={() => { setIsEditing(true); setEditValue(durations[mode]); }} style={styles.editBtnSimple}>
                            <Pencil size={16} /> Edit Duration
                        </button>
                    )}
                    {/* Save Button if editing */}
                    {isEditing && (
                        <button onClick={handleEditSave} style={{ ...styles.editBtnSimple, background: '#10b981', color: '#000' }}>
                            <Check size={16} /> Save
                        </button>
                    )}
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
    },
    editBtnSimple: {
        position: 'absolute',
        bottom: '-40px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(255,255,255,0.1)',
        border: 'none',
        color: '#fff',
        padding: '6px 12px',
        borderRadius: '20px',
        cursor: 'pointer',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'background 0.2s',
        whiteSpace: 'nowrap'
    },
    timeInput: {
        background: 'transparent',
        border: 'none',
        borderBottom: '2px solid #fff',
        color: '#fff',
        fontSize: '40px',
        width: '80px',
        textAlign: 'center',
        outline: 'none',
        fontWeight: 'bold'
    }
};

export default Focus;
