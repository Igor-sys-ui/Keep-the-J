// =============================================
// FAVORIS.JS — Système de coups de cœur
// =============================================

import { ajouterItem, lireJeuUneFois, supprimerItem } from "./db.js";

export async function estFavori(code, role, jeu, itemId) {
  const favoris = await lireJeuUneFois(code, "jeu_favoris");
  return favoris.find(f => f.auteur === role && f.jeu === jeu && f.itemId === itemId);
}

export async function toggleFavori(code, role, jeu, itemId, apercu) {
  const existant = await estFavori(code, role, jeu, itemId);
  if (existant) {
    await supprimerItem(code, "jeu_favoris", existant.id);
    return false;
  } else {
    await ajouterItem(code, "jeu_favoris", {
      auteur: role, jeu, itemId,
      apercu: apercu.substring(0, 100),
      ts: Date.now()
    });
    return true;
  }
}
