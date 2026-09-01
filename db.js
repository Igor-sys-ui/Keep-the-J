// =============================================
// DB.JS — Fonctions utilitaires Firestore
// =============================================

import { db } from "./firebase-config.js";
import {
  doc, collection, addDoc, updateDoc, deleteDoc,
  onSnapshot, getDoc, getDocs, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

// Tri côté client par creeAt (tolère les null = docs en cours d'écriture)
function trierParDate(items) {
  return items.sort((a, b) => {
    const ta = a.creeAt?.toMillis ? a.creeAt.toMillis() : (typeof a.creeAt === "number" ? a.creeAt : 0);
    const tb = b.creeAt?.toMillis ? b.creeAt.toMillis() : (typeof b.creeAt === "number" ? b.creeAt : 0);
    return ta - tb;
  });
}

export function refSalon(code) {
  return doc(db, "salons", code);
}

export function refJeu(code, nomJeu) {
  return collection(db, "salons", code, nomJeu);
}

// Lecture unique du document salon
export async function lireSalon(code) {
  const snap = await getDoc(refSalon(code));
  return snap.exists() ? snap.data() : null;
}

// Écoute temps réel d'une sous-collection
// Trie côté client pour inclure les docs dont creeAt est encore null
export function ecouterJeu(code, nomJeu, callback) {
  const ref = refJeu(code, nomJeu);
  return onSnapshot(ref, (snap) => {
    const items = trierParDate(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    callback(items);
  });
}

// Lecture unique d'une sous-collection (stats, favoris, profil)
// Retourne [] si la collection n'existe pas encore
export async function lireJeuUneFois(code, nomJeu) {
  try {
    const snap = await getDocs(refJeu(code, nomJeu));
    return trierParDate(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (e) {
    console.warn(`lireJeuUneFois "${nomJeu}":`, e.message);
    return [];
  }
}

// Ajouter un document
export async function ajouterItem(code, nomJeu, data) {
  const ref = await addDoc(refJeu(code, nomJeu), {
    ...data,
    creeAt: serverTimestamp()
  });
  return ref.id;
}

// Modifier un document existant
export async function modifierItem(code, nomJeu, id, data) {
  await updateDoc(doc(db, "salons", code, nomJeu, id), data);
}

// Supprimer un document
export async function supprimerItem(code, nomJeu, id) {
  await deleteDoc(doc(db, "salons", code, nomJeu, id));
}

// Mettre à jour un score global (lecture → incrémentation → écriture)
export async function mettreAJourScore(code, jeu, role, delta) {
  const cle  = role === "joueurA" ? "A" : "B";
  const snap = await getDoc(refSalon(code));
  if (!snap.exists()) return;
  const actuel = snap.data().scores?.[jeu]?.[cle] ?? 0;
  await updateDoc(refSalon(code), {
    [`scores.${jeu}.${cle}`]: actuel + delta
  });
}

// Lire les scores (lecture unique)
export async function lireScores(code) {
  const data = await lireSalon(code);
  return data?.scores ?? { points: { A: 0, B: 0 }, pictionary: { A: 0, B: 0 } };
}
