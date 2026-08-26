// =============================================
// FAVORIS.JS — Système de coups de cœur
//
// Placé à la RACINE (même niveau que db.js).
// Importé depuis les jeux avec :
//   import { chargerMesFavoris, estDejaFavori, toggleFavori } from "../favoris.js";
//
// Utilisation dans un fichier jeu :
//   1. await chargerMesFavoris(session.code, session.role) — au démarrage
//   2. estDejaFavori("jeu_points", id) — pour afficher ❤️ ou 🤍 au rendu
//   3. await toggleFavori(...) — au clic sur le bouton
// =============================================

import { ajouterItem, lireJeuUneFois, supprimerItem } from "./db.js";

// Cache en mémoire : Set des clés "jeu__itemId" déjà en favori
let _cache = null;

// Charger tous les favoris de l'utilisateur une fois au démarrage
// Doit être appelé avec await avant tout rendu de liste
export async function chargerMesFavoris(code, role) {
  const favoris = await lireJeuUneFois(code, "jeu_favoris");
  _cache = new Set(
    favoris
      .filter(f => f.auteur === role)
      .map(f => f.jeu + "__" + f.itemId)
  );
  return _cache;
}

// Vérifie si un élément est déjà en favori (synchrone, depuis le cache)
export function estDejaFavori(jeu, itemId) {
  if (!_cache) return false;
  return _cache.has(jeu + "__" + itemId);
}

// Bascule favori : ajoute si absent, retire si présent
// Retourne true si ajouté, false si retiré
export async function toggleFavori(code, role, jeu, itemId, apercu) {
  try {
    // Toujours lire Firestore pour éviter les désynchronisations
    const favoris  = await lireJeuUneFois(code, "jeu_favoris");
    const existant = favoris.find(
      f => f.auteur === role && f.jeu === jeu && f.itemId === itemId
    );
    if (existant) {
      await supprimerItem(code, "jeu_favoris", existant.id);
      if (_cache) _cache.delete(jeu + "__" + itemId);
      return false;
    } else {
      await ajouterItem(code, "jeu_favoris", {
        auteur: role,
        jeu,
        itemId,
        apercu: String(apercu).replace(/'/g, "").substring(0, 100),
        ts: Date.now()
      });
      if (_cache) _cache.add(jeu + "__" + itemId);
      return true;
    }
  } catch (e) {
    console.error("toggleFavori erreur:", e);
    return false;
  }
}
