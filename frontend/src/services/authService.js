import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { auth } from "../config/firebase";

export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User registered successfully:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User logged in successfully:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Error logging in user:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log("User logged out successfully");
  } catch (error) {
    console.error("Error logging out user:", error);
    throw error;
  }
};

export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};