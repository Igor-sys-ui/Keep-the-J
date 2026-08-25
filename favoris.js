import { ajouterItem, lireJeuUneFois, supprimerItem } from "./db.js";

// Cache local pour éviter des lectures répétées
let cacheIds = null;

// Charger tous les IDs favoris de l'utilisateur (une fois par session)
export async function chargerMesFavoris(code, role) {
  const favoris = await lireJeuUneFois(code, "jeu_favoris");
  cacheIds = new Set(
    favoris
      .filter(f => f.auteur === role)
      .map(f => f.jeu + "__" + f.itemId)
  );
  return cacheIds;
}

export function estDejaFavori(jeu, itemId) {
  if (!cacheIds) return false;
  return cacheIds.has(jeu + "__" + itemId);
}

export async function toggleFavori(code, role, jeu, itemId, apercu) {
  try {
    const favoris  = await lireJeuUneFois(code, "jeu_favoris");
    const existant = favoris.find(f => f.auteur === role && f.jeu === jeu && f.itemId === itemId);
    if (existant) {
      await supprimerItem(code, "jeu_favoris", existant.id);
      if (cacheIds) cacheIds.delete(jeu + "__" + itemId);
      return false;
    } else {
      await ajouterItem(code, "jeu_favoris", {
        auteur: role,
        jeu,
        itemId,
        apercu: String(apercu).replace(/'/g, "").substring(0, 100),
        ts: Date.now()
      });
      if (cacheIds) cacheIds.add(jeu + "__" + itemId);
      return true;
    }
  } catch(e) {
    console.error("Erreur favori:", e);
    return false;
  }
}
