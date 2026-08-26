// =============================================
// DB.JS — Fonctions utilitaires Firestore
// =============================================

import { db } from "./firebase-config.js";
import {
  doc, collection, addDoc, updateDoc, deleteDoc,
  onSnapshot, getDoc, getDocs, query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

export function refSalon(code) {
  return doc(db, "salons", code);
}

export function refJeu(code, nomJeu) {
  return collection(db, "salons", code, nomJeu);
}

// Lecture unique du salon (document principal)
export async function lireSalon(code) {
  const snap = await getDoc(refSalon(code));
  return snap.exists() ? snap.data() : null;
}

// Écoute temps réel d'une sous-collection de jeu
export function ecouterJeu(code, nomJeu, callback) {
  const ref = query(refJeu(code, nomJeu), orderBy("creeAt", "asc"));
  return onSnapshot(ref, (snap) => {
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(items);
  });
}

// Lecture unique d'une sous-collection (pour stats, favoris, profil)
// Retourne [] si la collection n'existe pas encore
export async function lireJeuUneFois(code, nomJeu) {
  try {
    const ref  = query(refJeu(code, nomJeu), orderBy("creeAt", "asc"));
    const snap = await getDocs(ref);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.warn(`lireJeuUneFois: collection "${nomJeu}" inaccessible`, e.message);
    return [];
  }
}

// Ajouter un document dans une sous-collection de jeu
export async function ajouterItem(code, nomJeu, data) {
  const ref = await addDoc(refJeu(code, nomJeu), {
    ...data,
    creeAt: serverTimestamp()
  });
  return ref.id;
}

// Modifier un document existant
export async function modifierItem(code, nomJeu, id, data) {
  const ref = doc(db, "salons", code, nomJeu, id);
  await updateDoc(ref, data);
}

// Supprimer un document
export async function supprimerItem(code, nomJeu, id) {
  const ref = doc(db, "salons", code, nomJeu, id);
  await deleteDoc(ref);
}

// Mettre à jour un score global dans le document salon
export async function mettreAJourScore(code, jeu, role, delta) {
  const cle  = role === "joueurA" ? "A" : "B";
  const ref  = refSalon(code);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const scores = snap.data().scores ?? {};
  const actuel = scores[jeu]?.[cle] ?? 0;
  await updateDoc(ref, {
    [`scores.${jeu}.${cle}`]: actuel + delta
  });
}

// Lire les scores (lecture unique)
export async function lireScores(code) {
  const data = await lireSalon(code);
  return data?.scores ?? { points: { A: 0, B: 0 }, pictionary: { A: 0, B: 0 } };
}
