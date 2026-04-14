/* ============================================
   CAPRICE DES ÎLES — Service Worker
   Stratégie hybride :
   - Cache First pour les fichiers statiques (HTML, CSS, JS, fonts, images)
   - Network First pour les données du menu (Opensheet) avec fallback cache
   ============================================ */

// ⚠️ INCRÉMENTER CETTE VERSION À CHAQUE DÉPLOIEMENT pour forcer
// la mise à jour des fichiers statiques en cache.
const VERSION = 'v1.0.0';
const STATIC_CACHE = `caprice-static-${VERSION}`;
const RUNTIME_CACHE = `caprice-runtime-${VERSION}`;

// Fichiers à pré-cacher au moment de l'installation
const STATIC_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './data/menu.json',
  './manifest.json',
  './img/logo.png',
  './img/logo.svg',
  './img/icon-192.png',
  './img/icon-512.png',
  './img/apple-touch-icon.png',
];

// ---- INSTALL : pré-cache des fichiers statiques ----
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting()) // active immédiatement la nouvelle version
      .catch(err => console.error('[SW] Erreur install:', err))
  );
});

// ---- ACTIVATE : nettoyage des anciens caches ----
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys
        .filter(k => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
        .map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// ---- FETCH : routage selon le type de ressource ----
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore les requêtes non-GET
  if (request.method !== 'GET') return;

  // ---- 1. Données du menu (Opensheet) → Network First ----
  // On essaie d'abord la version en ligne (pour avoir les dernières modifs),
  // et seulement si offline on retombe sur la version mise en cache.
  if (url.hostname === 'opensheet.elk.sh') {
    event.respondWith(networkFirst(request));
    return;
  }

  // ---- 2. Google Fonts → Cache First (changent jamais) ----
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(request));
    return;
  }

  // ---- 3. Tout le reste (statique du site) → Cache First ----
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Pour tout le reste (pas d'origine connue), on laisse passer
});

// ---- STRATÉGIES ----

// Cache First : on sert depuis le cache si dispo, sinon réseau + mise en cache
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    // On ne cache que les réponses valides
    if (response && response.status === 200 && response.type !== 'opaque') {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    // Si tout plante, on essaie de servir au moins la page d'accueil depuis le cache
    if (request.mode === 'navigate') {
      const fallback = await caches.match('./index.html');
      if (fallback) return fallback;
    }
    throw err;
  }
}

// Network First : on essaie le réseau, fallback sur le cache si offline
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    // Hors-ligne : on sert la dernière version mise en cache
    const cached = await caches.match(request);
    if (cached) return cached;
    throw err;
  }
}

// ---- MESSAGE : permet au site de demander une mise à jour forcée ----
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
