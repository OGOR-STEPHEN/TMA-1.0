import { db } from "./config";
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    increment,
    getDocs
} from "firebase/firestore";

// ADD HABIT
export const addHabitToDB = async (uid, title, category = "general") => {
    await addDoc(collection(db, "habits"), {
        uid,
        title,
        category,
        streak: 0,
        bestStreak: 0,
        lastCompletedDate: null,
        history: [], // Array of timestamps
        createdAt: serverTimestamp(),
    });
};

// FETCH HABITS
export const fetchHabitsFromDB = (uid, callback) => {
    const q = query(
        collection(db, "habits"),
        where("uid", "==", uid),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
        const habits = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        callback(habits);
    });
};

// COMPLETE HABIT (CHECK-IN)
export const checkInHabit = async (habitId, currentStreak, bestStreak) => {
    const today = new Date().toDateString(); // Simple string for compilation check

    // validation logic usually handled on client or cloud function, 
    // but here we just update the doc

    await updateDoc(doc(db, "habits", habitId), {
        streak: increment(1),
        bestStreak: currentStreak + 1 > bestStreak ? currentStreak + 1 : bestStreak,
        lastCompletedDate: serverTimestamp(),
        // We would ideally push to history array, but Firestore arrayUnion with timestamps 
        // can be tricky if we want simpler date strings. 
        // For now, we'll assume the client manages the history update or we just track streak.
    });
};

// RESET STREAK (If missed a day - typically called by a checker function)
export const resetHabitStreak = async (habitId) => {
    await updateDoc(doc(db, "habits", habitId), {
        streak: 0
    });
};

// DELETE HABIT
export const deleteHabitFromDB = (habitId) =>
    deleteDoc(doc(db, "habits", habitId));
