import { ref, set, onValue, remove, push } from "firebase/database";
import { db } from "../config/firebase";

// Function to write data to a specific path
export const writeData = async (path, data) => {
  try {
    await set(ref(db, path), data);
    console.log(`Data written successfully to ${path}`);
  } catch (error) {
    console.error("Error writing data:", error);
    throw error;
  }
};

// Function to read data from a specific path
export const readData = (path, callback) => {
  const dataRef = ref(db, path);
  onValue(dataRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });
};

// Function to remove data from a specific path
export const removeData = async (path) => {
  try {
    await remove(ref(db, path));
    console.log(`Data removed successfully from ${path}`);
  } catch (error) {
    console.error("Error removing data:", error);
    throw error;
  }
};

// Function to push new data to a list (generates a unique key)
export const pushData = async (path, data) => {
  try {
    const newListRef = push(ref(db, path));
    await set(newListRef, data);
    console.log(`Data pushed successfully to ${path} with key: ${newListRef.key}`);
    return newListRef.key;
  } catch (error) {
    console.error("Error pushing data:", error);
    throw error;
  }
};