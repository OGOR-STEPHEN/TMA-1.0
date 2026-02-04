import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB32VD_wMNpHUCrw_bJBBpHVlJmLfzd0lg",
  authDomain: "time-management-app-8a7d3.firebaseapp.com",
  projectId: "time-management-app-8a7d3",
  storageBucket: "time-management-app-8a7d3.firebasestorage.app",
  messagingSenderId: "88077950402",
  appId: "1:88077950402:web:5b52fe25b80d151b9a4a5b",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
