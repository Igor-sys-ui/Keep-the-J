// =============================================
// FAVORIS.JS — Système de coups de cœur
// Placé à la RACINE du projet (même niveau que db.js)
// Importé depuis les jeux avec : import { toggleFavori } from "../favoris.js";
// =============================================

import { ajouterItem, lireJeuUneFois, supprimerItem } from "./db.js";

// Basculer favori (ajouter ou retirer) — retourne true si ajouté, false si retiré
export async function toggleFavori(code, role, jeu, itemId, apercu) {
  try {
    const favoris  = await lireJeuUneFois(code, "jeu_favoris");
    const existant = favoris.find(f => f.auteur === role && f.jeu === jeu && f.itemId === itemId);
    if (existant) {
      await supprimerItem(code, "jeu_favoris", existant.id);
      return false;
    } else {
      await ajouterItem(code, "jeu_favoris", {
        auteur: role,
        jeu,
        itemId,
        apercu: String(apercu).replace(/'/g, "").substring(0, 100),
        ts: Date.now()
      });
      return true;
    }
  } catch(e) {
    console.error("Erreur favori:", e);
    return false;
  }
}
