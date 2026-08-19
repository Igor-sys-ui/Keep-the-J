// =============================================
// AUTH.JS — Connexion et identité des joueurs
// =============================================

import { auth, db } from "./firebase-config.js";
import { signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { doc, setDoc, getDoc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

// --- Génère un code de salon aléatoire ---
export function genererCode() {
  const mots = ["LUNE","ETOILE","COEUR","NUAGE","SOLEIL","RIVIERE","FORET","TIGRE","RENARD","HIBOU"];
  const mot = mots[Math.floor(Math.random() * mots.length)];
  const num = Math.floor(10 + Math.random() * 90);
  return mot + num;
}

// --- Connexion anonyme Firebase ---
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
    scores: { points: { A: 0, B: 0 }, pictionary: { A: 0, B: 0 }, concours: { A: 0, B: 0 } }
  });
  localStorage.setItem("ktj_code", code);
  localStorage.setItem("ktj_role", "joueurA");
  localStorage.setItem("ktj_prenom", prenomA);
}

// --- Rejoindre un salon (Joueur B uniquement) ---
// Cette fonction est appelée SEULEMENT depuis l'onglet "Rejoindre"
// Elle ne gère PAS le retour du joueur A dans son propre salon
export async function rejoindre(code, prenomB) {
  const ref = doc(db, "salons", code);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    throw new Error("Code introuvable. Vérifie l'orthographe.");
  }
  const data = snap.data();
  const uid = auth.currentUser.uid;

  // Le joueur B revient dans son salon (même uid ou même prénom)
  if (data.joueurB !== null) {
    const memeUid    = data.joueurB.uid === uid;
    const memePrenom = data.joueurB.prenom.toLowerCase() === prenomB.toLowerCase();
    if (memeUid || memePrenom) {
      // C'est bien le joueur B qui revient, on le reconnecte
      localStorage.setItem("ktj_code", code);
      localStorage.setItem("ktj_role", "joueurB");
      localStorage.setItem("ktj_prenom", data.joueurB.prenom);
      return;
    }
    // Le joueur A essaie de rejoindre via l'onglet "Rejoindre"
    const estJoueurA = data.joueurA.uid === uid || data.joueurA.prenom.toLowerCase() === prenomB.toLowerCase();
    if (estJoueurA) {
      throw new Error("Tu es le créateur de ce salon. Utilise l'onglet 'Créer' avec ce code, ou recrée le salon.");
    }
    // Quelqu'un d'autre — salon complet
    throw new Error("Ce salon est déjà complet.");
  }

  // Salon libre : on inscrit le joueur B
  await updateDoc(ref, {
    joueurB: { prenom: prenomB, uid }
  });
  localStorage.setItem("ktj_code", code);
  localStorage.setItem("ktj_role", "joueurB");
  localStorage.setItem("ktj_prenom", prenomB);
}

// --- Récupérer la session en cours ---
export function getSession() {
  return {
    code:   localStorage.getItem("ktj_code"),
    role:   localStorage.getItem("ktj_role"),
    prenom: localStorage.getItem("ktj_prenom")
  };
}

// --- Écouter en temps réel les changements du salon ---
export function ecouterSalon(code, callback) {
  const ref = doc(db, "salons", code);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) callback(snap.data());
  });
}

// --- Déconnexion ---
export function deconnecter() {
  localStorage.removeItem("ktj_code");
  localStorage.removeItem("ktj_role");
  localStorage.removeItem("ktj_prenom");
  window.location.href = "index.html";
}
