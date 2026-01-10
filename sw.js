const CACHE_NAME = 'citation-tools-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/apa.html',
    '/mla.html',
    '/chicago.html',
    '/guide.html',
    '/examples.html',
    '/tips.html',
    '/contact.html',
    '/privacy.html',
    '/terms.html',
    '/disclaimer.html'
];

// Install Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// Fetch from cache or network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

// Update cache
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
