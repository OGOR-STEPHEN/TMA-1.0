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
} from "firebase/firestore";

// ADD TASK
export const addTaskToDB = async (uid, taskData) => {
  // taskData should include: text, priority, category, dueDate, reminderTime, etc.
  const { 
    text, 
    priority = "medium", 
    category = "personal", 
    dueDate = null, 
    dueTime = null,
    reminderTime = null,
    subtasks = [],
    status = "todo" // todo, in-progress, done
  } = taskData;

  const docRef = await addDoc(collection(db, "tasks"), {
    uid,
    text,
    completed: false, // Legacy field, mapped to status='done'
    status, 
    priority,
    category,
    dueDate,
    dueTime: dueTime || reminderTime || null,
    reminderTime: reminderTime || dueTime || null,
    subtasks,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

// REALTIME FETCH TASKS
export const fetchTasksFromDB = (uid, callback) => {
  const q = query(
    collection(db, "tasks"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map((doc) => {
      const data = doc.data();
      // Backwards compatibility for existing tasks
      return {
        id: doc.id,
        status: data.status || (data.completed ? "done" : "todo"),
        priority: data.priority || "medium",
        category: data.category || "personal",
        dueTime: data.dueTime || data.reminderTime || null,
        subtasks: data.subtasks || [],
        ...data,
      };
    });
    callback(tasks);
  });
};

// UPDATE TASK
export const updateTaskInDB = (taskId, data) =>
  updateDoc(doc(db, "tasks", taskId), data);

// DELETE TASK
export const deleteTaskFromDB = (taskId) =>
  deleteDoc(doc(db, "tasks", taskId));
