// =============================================
// AUTH.JS — Connexion et identité des joueurs
//
// Principe : les deux joueurs partagent un même
// "code de salon" (ex: "TIGRE42"). Ce code est
// le nom du document Firestore qui contient
// toutes les données de leur partie.
//
// Joueur A crée le salon → choisit son prénom.
// Joueur B rejoint avec le code → choisit son prénom.
// Les deux sont ensuite identifiés par leur rôle
// "joueurA" ou "joueurB" dans Firestore.
// =============================================
 
import { auth, db } from "./firebase-config.js";
import { signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { doc, setDoc, getDoc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";
 
// --- Génère un code de salon aléatoire (ex: "CHAT47") ---
export function genererCode() {
  const mots = ["LUNE","ETOILE","COEUR","NUAGE","SOLEIL","RIVIERE","FORET","TIGRE","RENARD","HIBOU"];
  const mot = mots[Math.floor(Math.random() * mots.length)];
  const num = Math.floor(10 + Math.random() * 90); // 10-99
  return mot + num;
}
 
// --- Connexion anonyme Firebase (juste pour avoir un uid) ---
export async function connecterFirebase() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        resolve(user);
      } else {
        const cred = await signInAnonymously(auth);
        resolve(cred.user);
      }
    });
  });
}
 
// --- Créer un nouveau salon (Joueur A) ---
export async function creerSalon(code, prenomA) {
  const ref = doc(db, "salons", code);
  const existant = await getDoc(ref);
  if (existant.exists()) {
    throw new Error("Ce code existe déjà, réessaie.");
  }
  await setDoc(ref, {
    code: code,
    joueurA: { prenom: prenomA, uid: auth.currentUser.uid },
    joueurB: null,
    creeAt: new Date().toISOString(),
    scores: { points: { A: 0, B: 0 }, pictionary: { A: 0, B: 0 } }
  });
  // Sauvegarder localement qui on est
  localStorage.setItem("ktj_code", code);
  localStorage.setItem("ktj_role", "joueurA");
  localStorage.setItem("ktj_prenom", prenomA);
}
 
// --- Rejoindre un salon existant (Joueur B) ---
export async function rejoindre(code, prenomB) {
  const ref = doc(db, "salons", code);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    throw new Error("Code introuvable. Vérifie l'orthographe.");
  }
  const data = snap.data();
  if (data.joueurB !== null) {
    throw new Error("Ce salon est déjà complet.");
  }
  await updateDoc(ref, {
    joueurB: { prenom: prenomB, uid: auth.currentUser.uid }
  });
  localStorage.setItem("ktj_code", code);
  localStorage.setItem("ktj_role", "joueurB");
  localStorage.setItem("ktj_prenom", prenomB);
}
 
// --- Récupérer la session en cours (depuis localStorage) ---
export function getSession() {
  return {
    code:   localStorage.getItem("ktj_code"),
    role:   localStorage.getItem("ktj_role"),   // "joueurA" ou "joueurB"
    prenom: localStorage.getItem("ktj_prenom")
  };
}
 
// --- Écouter en temps réel les changements du salon ---
// callback(data) est appelé à chaque mise à jour Firestore
export function ecouterSalon(code, callback) {
  const ref = doc(db, "salons", code);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) callback(snap.data());
  });
}
 
// --- Déconnexion (efface la session locale) ---
export function deconnecter() {
  localStorage.removeItem("ktj_code");
  localStorage.removeItem("ktj_role");
  localStorage.removeItem("ktj_prenom");
  window.location.href = "index.html";
}
