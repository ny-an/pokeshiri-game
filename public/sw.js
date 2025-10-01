const CACHE_NAME = 'pokeshiri-game-v1';
const urlsToCache = [
  '/pokeshiri-game/',
  '/pokeshiri-game/manifest.json',
  '/pokeshiri-game/icon-192x192.png',
  '/pokeshiri-game/icon-512x512.png',
  '/pokeshiri-game/apple-touch-icon.png',
  '/pokeshiri-game/og-image.png'
];

// インストールイベント
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// フェッチイベント
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュに存在する場合はそれを返す
        if (response) {
          return response;
        }

        // ネットワークから取得
        return fetch(event.request).then((response) => {
          // 有効なレスポンスかチェック
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // レスポンスをクローン
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

// アクティベートイベント
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
