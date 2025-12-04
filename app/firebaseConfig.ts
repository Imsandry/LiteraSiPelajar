// app/firebaseConfig.ts
import { getApp, getApps, initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// --- Konfigurasi Firebase ---
const firebaseConfig = {
  apiKey: "AIzaSyBK8bj5cMHhOf5IerajNRz9-utWr4fCMKo",
  authDomain: "literasipelajar-5ee61.firebaseapp.com",
  databaseURL: "https://literasipelajar-5ee61-default-rtdb.firebaseio.com",
  projectId: "literasipelajar-5ee61",
  storageBucket: "literasipelajar-5ee61.firebasestorage.app",
  messagingSenderId: "511909199846",
  appId: "1:511909199846:web:7653a76ca1fe0fcb35e027"
};

// Jika sudah ada app, pakai itu. Jika tidak, buat baru.
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApp();

export const db = getDatabase(app);

// Debug log
console.log("Firebase initialized:", app.name);
