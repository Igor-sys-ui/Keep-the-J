import { db } from "./firebase-config.js";
import {
  doc, collection, addDoc, updateDoc, deleteDoc,
  onSnapshot, getDoc, getDocs, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

function trierParDate(items) {
  return items.sort((a, b) => {
    const ta = a.creeAt?.toMillis ? a.creeAt.toMillis() : (typeof a.creeAt === "number" ? a.creeAt : 0);
    const tb = b.creeAt?.toMillis ? b.creeAt.toMillis() : (typeof b.creeAt === "number" ? b.creeAt : 0);
    return ta - tb;
  });
}

export function refSalon(code) { return doc(db, "salons", code); }
export function refJeu(code, nomJeu) { return collection(db, "salons", code, nomJeu); }

export async function lireSalon(code) {
  const snap = await getDoc(refSalon(code));
  return snap.exists() ? snap.data() : null;
}

export function ecouterJeu(code, nomJeu, callback) {
  return onSnapshot(refJeu(code, nomJeu), (snap) => {
    callback(trierParDate(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  });
}

export async function lireJeuUneFois(code, nomJeu) {
  try {
    const snap = await getDocs(refJeu(code, nomJeu));
    return trierParDate(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (e) {
    console.warn(`lireJeuUneFois "${nomJeu}":`, e.message);
    return [];
  }
}

export async function ajouterItem(code, nomJeu, data) {
  const ref = await addDoc(refJeu(code, nomJeu), { ...data, creeAt: serverTimestamp() });
  return ref.id;
}

export async function modifierItem(code, nomJeu, id, data) {
  await updateDoc(doc(db, "salons", code, nomJeu, id), data);
}

export async function supprimerItem(code, nomJeu, id) {
  await deleteDoc(doc(db, "salons", code, nomJeu, id));
}

export async function mettreAJourScore(code, jeu, role, delta) {
  const cle  = role === "joueurA" ? "A" : "B";
  const snap = await getDoc(refSalon(code));
  if (!snap.exists()) return;
  const actuel = snap.data().scores?.[jeu]?.[cle] ?? 0;
  await updateDoc(refSalon(code), { [`scores.${jeu}.${cle}`]: actuel + delta });
}

export async function lireScores(code) {
  const data = await lireSalon(code);
  return data?.scores ?? { points: { A: 0, B: 0 }, pictionary: { A: 0, B: 0 } };
}
