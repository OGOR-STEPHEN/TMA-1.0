import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "./config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

export const loginUser = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const logoutUser = () => signOut(auth);

// Create account with user data
export const signupUser = async (email, password, fullName, username) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store additional user data in Firestore
    try {
      await setDoc(doc(db, "users", user.uid), {
        fullName: fullName,
        email: email,
        username: username,
        createdAt: new Date(),
      });
      console.log("User document created in Firestore");
    } catch (firestoreError) {
      console.error("Firestore error:", firestoreError);
      throw new Error(`Failed to save user profile: ${firestoreError.message}`);
    }

    return userCredential;
  } catch (error) {
    console.error("Auth error:", error);
    throw error;
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

console.log("Auth helpers loaded");