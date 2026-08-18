// =============================================
// SERVICE WORKER — Keep The J
//
// Ce fichier permet à l'app de se comporter
// comme une vraie appli mobile (installable,
// fonctionne partiellement sans internet).
// =============================================

const CACHE = "keep-the-j-v1";

// Fichiers à mettre en cache pour le mode hors-ligne
const FICHIERS = [
  "/index.html",
  "/app.html",
  "/style.css",
  "/firebase-config.js",
  "/auth.js",
  "/db.js",
  "/manifest.json",
  "/jeux/points.html",
  "/jeux/boite.html",
  "/jeux/pictionary.html",
  "/jeux/questions.html"
];

// Installation : mise en cache des fichiers
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FICHIERS))
  );
  self.skipWaiting();
});

// Activation : nettoyage des anciens caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Interception des requêtes : cache en priorité, réseau en fallback
self.addEventListener("fetch", (e) => {
  // Ne pas intercepter les requêtes Firebase (temps réel)
  if (e.request.url.includes("firebase") || e.request.url.includes("google")) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
