// 个人博客 Service Worker：静态资源缓存优先，离线可读
// 更新站点内容后把 CACHE 版本号 +1，旧缓存会自动清理
const CACHE = 'yiteng-blog-v37';

const PRECACHE = [
    './',
    './index.html',
    './gallery.html',
    './daily.html',
    './style.css',
    './script.js',
    './favicon.svg',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './profile.webp',
    './1.webp',
    './8.webp',
    './19.webp'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE)
            .then(function(cache) { return cache.addAll(PRECACHE); })
            .then(function() { return self.skipWaiting(); })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys()
            .then(function(keys) {
                return Promise.all(keys.filter(function(key) {
                    return key !== CACHE;
                }).map(function(key) {
                    return caches.delete(key);
                }));
            })
            .then(function() { return self.clients.claim(); })
    );
});

self.addEventListener('fetch', function(event) {
    const request = event.request;

    // 只处理本站 GET 请求
    if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
        return;
    }

    event.respondWith(
        caches.match(request).then(function(cached) {
            if (cached) {
                // 缓存命中后后台顺带更新
                fetch(request).then(function(response) {
                    if (response && response.status === 200) {
                        caches.open(CACHE).then(function(cache) {
                            cache.put(request, response.clone());
                        });
                    }
                }).catch(function() {});
                return cached;
            }

            return fetch(request).then(function(response) {
                if (response && response.status === 200 && response.type === 'basic') {
                    const copy = response.clone();
                    caches.open(CACHE).then(function(cache) {
                        cache.put(request, copy);
                    });
                }
                return response;
            }).catch(function() {
                // 离线兜底：导航请求回首页缓存
                if (request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
