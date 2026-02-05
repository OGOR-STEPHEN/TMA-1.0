import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import {
    addHabitToDB,
    fetchHabitsFromDB,
    checkInHabit
} from "../firebase/habits";
import { auth } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { Flame, Plus, Check } from "lucide-react";
import canvasConfetti from "canvas-confetti";

const Habits = () => {
    const [habits, setHabits] = useState([]);
    const [newHabit, setNewHabit] = useState("");

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchHabitsFromDB(user.uid, setHabits);
            }
        });
        return unsub;
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newHabit.trim()) return;
        const user = auth.currentUser;
        await addHabitToDB(user.uid, newHabit);
        setNewHabit("");
    };

    const handleCheckIn = async (habit) => {
        // Prevent double check-in same day (simplified logic)
        // In a real app we'd check lastCompletedDate vs today
        await checkInHabit(habit.id, habit.streak, habit.bestStreak || 0);

        // Confetti effect
        canvasConfetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    };

    return (
        <Layout>
            <div style={styles.header}>
                <h1>Habit Tracker</h1>
            </div>

            <div style={styles.addSection}>
                <form onSubmit={handleAdd} style={styles.form}>
                    <input
                        value={newHabit}
                        onChange={(e) => setNewHabit(e.target.value)}
                        placeholder="New habit..."
                        style={styles.input}
                    />
                    <button type="submit" style={styles.addBtn}><Plus /></button>
                </form>
            </div>

            <div style={styles.grid}>
                {habits.map(habit => (
                    <div key={habit.id} style={styles.card}>
                        <div style={styles.cardHeader}>
                            <h3>{habit.title}</h3>
                            <div style={styles.streak}>
                                <Flame size={18} color="#f59e0b" />
                                <span>{habit.streak}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => handleCheckIn(habit)}
                            style={styles.checkInBtn}
                        >
                            <Check size={20} /> Check In
                        </button>

                        <div style={styles.stats}>
                            Best: {habit.bestStreak || 0}
                        </div>
                    </div>
                ))}
            </div>
        </Layout>
    );
};

const styles = {
    header: { marginBottom: "30px" },
    form: { display: "flex", gap: "10px", marginBottom: "30px", maxWidth: "400px" },
    input: {
        flex: 1,
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.05)",
        color: "#fff"
    },
    addBtn: {
        padding: "0 20px",
        borderRadius: "8px",
        background: "#a75885",
        border: "none",
        color: "#fff",
        cursor: "pointer"
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "20px"
    },
    card: {
        background: "rgba(255,255,255,0.03)",
        padding: "20px",
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.05)",
        display: "flex",
        flexDirection: "column",
        gap: "16px"
    },
    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },
    streak: {
        display: "flex",
        alignItems: "center",
        gap: "4px",
        color: "#f59e0b",
        fontWeight: "bold"
    },
    checkInBtn: {
        width: "100%",
        padding: "10px",
        borderRadius: "8px",
        border: "1px solid #a75885",
        background: "rgba(167, 88, 133, 0.1)",
        color: "#a75885",
        fontWeight: "600",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        cursor: "pointer",
        transition: "all 0.2s"
    },
    stats: {
        fontSize: "12px",
        color: "rgba(255,255,255,0.4)",
        textAlign: "center"
    }
};

export default Habits;
