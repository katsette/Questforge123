import { getFirestore, doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { app } from "../config/firebase";

const db = getFirestore(app);

// Function to write data to a specific document path
export const writeData = async (collectionName, docId, data) => {
  try {
    await setDoc(doc(db, collectionName, docId), data, { merge: true });
    console.log(`Data written successfully to ${collectionName}/${docId}`);
  } catch (error) {
    console.error("Error writing data:", error);
    throw error;
  }
};

// Function to read data from a specific document path
export const readData = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error reading data:", error);
    throw error;
  }
};

// Function to remove a document from a specific path
export const removeData = async (collectionName, docId) => {
  try {
    await deleteDoc(doc(db, collectionName, docId));
    console.log(`Document removed successfully from ${collectionName}/${docId}`);
  } catch (error) {
    console.error("Error removing data:", error);
    throw error;
  }
};

// Function to add a new document to a collection (generates a unique ID)
export const addDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    console.log(`Document added successfully to ${collectionName} with ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error("Error adding document:", error);
    throw error;
  }
};

// Function to query documents from a collection
export const queryDocuments = async (collectionName, conditions = []) => {
  try {
    let q = collection(db, collectionName);
    conditions.forEach(condition => {
      q = query(q, where(condition.field, condition.operator, condition.value));
    });
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error querying documents:", error);
    throw error;
  }
};
