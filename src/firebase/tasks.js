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
export const addTaskToDB = async (uid, text) => {
  await addDoc(collection(db, "tasks"), {
    uid,
    text,
    completed: false,
    createdAt: serverTimestamp(),
  });
};

// REALTIME FETCH TASKS
export const fetchTasksFromDB = (uid, callback) => {
  const q = query(
    collection(db, "tasks"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(tasks);
  });
};

// UPDATE TASK
export const updateTaskInDB = (taskId, data) =>
  updateDoc(doc(db, "tasks", taskId), data);

// DELETE TASK
export const deleteTaskFromDB = (taskId) =>
  deleteDoc(doc(db, "tasks", taskId));
