/* Offline cache. Ball fields have bad signal — after one good load the whole
   app (quiz banks included) works with no connection at all. Only the shared
   Golden Chain needs the network, and that falls back to the last list seen.

   Bump CACHE_VERSION whenever you change app files, or phones will keep
   serving the old copy. */
const CACHE_VERSION = 'funfocus-v1';

const PRECACHE = [
  './',
  './index.html',
  './styles.css',
  './manifest.webmanifest',
  './icon.svg',
  './js/app.js',
  './js/config.js',
  './js/store.js',
  './js/chain.js',
  './js/ui.js',
  './js/fun.js',
  './js/focus.js',
  './js/data/roster.js',
  './js/data/fun-content.js',
  './js/data/hype.js',
  './js/data/phases.js',
  './js/data/reveal.js',
  './js/data/phase1.js',
  './js/data/phase2.js',
  './js/data/phase3.js',
  './js/data/phase4.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      // addAll is all-or-nothing; add individually so one miss can't break install.
      .then((cache) => Promise.all(PRECACHE.map((url) => cache.add(url).catch(() => null))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never cache the shared Golden Chain — always try the network, and if
  // there's no signal let the app fall back to its own saved copy.
  if (url.pathname.includes('/.netlify/functions/') || url.hostname.includes('firestore.googleapis.com')) {
    return;
  }

  // Cache-first for everything else, refreshing in the background.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && (response.type === 'basic' || response.type === 'cors')) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || network;
    }),
  );
});
