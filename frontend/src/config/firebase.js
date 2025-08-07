// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCe-TVn9KNg-rka7KjaLkxQUUEmCoRq_7o",
  authDomain: "questforce-ea8fb.firebaseapp.com",
  databaseURL: "https://questforce-ea8fb-default-rtdb.firebaseio.com",
  projectId: "questforce-ea8fb",
  storageBucket: "questforce-ea8fb.firebasestorage.app",
  messagingSenderId: "270810289924",
  appId: "1:270810289924:web:b7c9655f7a5340b8786251",
  measurementId: "G-VSH8MM6CMV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = getStorage(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, storage, db, auth };