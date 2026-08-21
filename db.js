// =============================================
// DB.JS — Fonctions utilitaires Firestore
//
// Ce fichier centralise toutes les opérations
// de lecture/écriture dans la base de données.
// Chaque jeu l'importe pour lire et sauvegarder.
//
// Structure Firestore :
//   salons/
//     {code}/
//       joueurA: { prenom, uid }
//       joueurB: { prenom, uid }
//       scores:  { points:{A,B}, pictionary:{A,B} }
//       jeu_points/     (sous-collection)
//         {id}: { texte, points, auteur, validee, ... }
//       jeu_boite/
//         {id}: { type, contenu, condition, visible, ... }
//       jeu_pictionary/
//         {id}: { dessin, souvenir, reponse, validee, ... }
//       jeu_questions/
//         {id}: { question, reponseA, reponseB, ... }
// =============================================

import { db } from "./firebase-config.js";
import {
  doc, collection, addDoc, updateDoc, deleteDoc,
  onSnapshot, getDoc, getDocs, query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

// --- Référence au document salon principal ---
export function refSalon(code) {
  return doc(db, "salons", code);
}

// --- Référence à une sous-collection d'un jeu ---
export function refJeu(code, nomJeu) {
  return collection(db, "salons", code, nomJeu);
}

// =============================================
// LECTURE
// =============================================

// Lire une fois le salon
export async function lireSalon(code) {
  const snap = await getDoc(refSalon(code));
  return snap.exists() ? snap.data() : null;
}

// Écouter en temps réel tous les documents d'un jeu
// → callback(tableau de { id, ...données })
export function ecouterJeu(code, nomJeu, callback) {
  const ref = query(refJeu(code, nomJeu), orderBy("creeAt", "asc"));
  return onSnapshot(ref, (snap) => {
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(items);
  });
}

// Lire une seule fois tous les documents d'un jeu (pour les stats)
export async function lireJeuUneFois(code, nomJeu) {
  const ref  = query(refJeu(code, nomJeu), orderBy("creeAt", "asc"));
  const snap = await getDocs(ref);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// =============================================
// ÉCRITURE
// =============================================

// Ajouter un document dans un jeu (retourne l'id créé)
export async function ajouterItem(code, nomJeu, data) {
  const ref = await addDoc(refJeu(code, nomJeu), {
    ...data,
    creeAt: serverTimestamp()
  });
  return ref.id;
}

// Modifier un document existant dans un jeu
export async function modifierItem(code, nomJeu, id, data) {
  const ref = doc(db, "salons", code, nomJeu, id);
  await updateDoc(ref, data);
}

// Supprimer un document d'un jeu
export async function supprimerItem(code, nomJeu, id) {
  const ref = doc(db, "salons", code, nomJeu, id);
  await deleteDoc(ref);
}

// Mettre à jour les scores globaux
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

// Lire les scores
export async function lireScores(code) {
  const data = await lireSalon(code);
  return data?.scores ?? { points: { A: 0, B: 0 }, pictionary: { A: 0, B: 0 } };
}
