// =============================================
// CONFIGURATION FIREBASE — keep-the-j
// Ce fichier est importé par tous les autres.
// Ne le modifie que si tu recrées le projet.
// =============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAURje-8Di4_ZCpU0L3xjFlB_MQQwvRGHM",
  authDomain: "keep-the-j.firebaseapp.com",
  projectId: "keep-the-j",
  storageBucket: "keep-the-j.firebasestorage.app",
  messagingSenderId: "873259777777",
  appId: "1:873259777777:web:615eda7c6c38558ff4b350"
};

const app = initializeApp(firebaseConfig);

export const db      = getFirestore(app);   // base de données
export const storage = getStorage(app);      // stockage photos
export const auth    = getAuth(app);         // authentification
