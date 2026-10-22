// 个人博客 Service Worker：静态资源缓存优先，离线可读
// 更新站点内容后把 CACHE 版本号 +1，旧缓存会自动清理
const CACHE = 'yiteng-blog-v20';

const PRECACHE = [
    './',
    './index.html',
    './gallery.html',
    './daily.html',
    './issue-018.html',
    './style.css',
    './script.js',
    './favicon.svg',
    './manifest.json',
    './1.webp',
    './2.webp',
    './3.webp',
    './4.webp',
    './5.webp',
    './6.webp',
    './7.webp',
    './8.webp',
    './15.webp',
    './19.webp',
    './issue-018-1.webp',
    './issue-018-2.webp',
    './issue-018-3.webp',
    './issue-018-4.webp',
    './profile.webp',
    './issue-005.html',
    './issue-005-1.webp',
    './issue-005-2.webp',
    './issue-005-3.webp',
    './issue-013.html',
    './issue-013-1.webp',
    './issue-013-2.webp',
    './issue-013-3.webp',
    './issue-017.html',
    './issue-017-1.webp',
    './issue-017-2.webp',
    './issue-017-3.webp',
    './issue-017-4.webp',
    './issue-019.html',
    './fig-2026-10-22-01-drop.webp',
    './fig-2026-10-22-01-memory.webp',
    './fig-2026-10-22-01-players.webp',
    './fig-2026-10-22-01-lockin.webp',
    './fig-2026-10-22-02-monitor.webp',
    './fig-2026-10-22-02-chain.webp',
    './fig-2026-10-22-02-orgs.webp',
    './fig-2026-10-22-02-practice.webp',
    './fig-2026-10-22-03-variance.webp',
    './fig-2026-10-22-03-cost.webp',
    './fig-2026-10-22-03-argon.webp',
    './fig-2026-10-22-03-tokens.webp',
    './fig-2026-10-22-04-inertia.webp',
    './fig-2026-10-22-04-walls.webp',
    './fig-2026-10-22-04-archive.webp',
    './fig-2026-10-22-04-prospect.webp',
    './issue-020.html',
    './fig-2026-10-23-01-funnel.webp',
    './fig-2026-10-23-01-toxins.webp',
    './fig-2026-10-23-01-evidence.webp',
    './fig-2026-10-23-01-limits.webp',
    './fig-2026-10-23-02-five.webp',
    './fig-2026-10-23-02-sandbox.webp',
    './fig-2026-10-23-02-threeknocks.webp',
    './fig-2026-10-23-02-practice.webp',
    './fig-2026-10-23-03-maia.webp',
    './fig-2026-10-23-03-bandwidth.webp',
    './fig-2026-10-23-03-rack.webp',
    './fig-2026-10-23-03-power.webp',
    './fig-2026-10-23-04-threefirms.webp',
    './fig-2026-10-23-04-phage.webp',
    './fig-2026-10-23-04-rubin.webp',
    './fig-2026-10-23-04-cache.webp',
    './issue-007.html',
    './fig-2026-10-10-01-decspeed.webp',
    './fig-2026-10-10-01-decprice.webp',
    './fig-2026-10-10-02-twopath.webp',
    './fig-2026-10-10-02-cost.webp',
    './fig-2026-10-10-03-apple.webp',
    './fig-2026-10-10-03-hub.webp',
    './fig-2026-10-10-04-items.webp',
    './fig-2026-10-10-04-science.webp',
    './issue-008.html',
    './fig-2026-10-11-01-pricing.webp',
    './fig-2026-10-11-02-stars.webp',
    './fig-2026-10-11-03-yield.webp',
    './fig-2026-10-11-04-map.webp',
    './issue-009.html',
    './fig-2026-10-12-01-timeline.webp',
    './fig-2026-10-12-01-gates.webp',
    './fig-2026-10-12-02-flow.webp',
    './fig-2026-10-12-02-stars.webp',
    './fig-2026-10-12-03-price.webp',
    './fig-2026-10-12-03-area.webp',
    './fig-2026-10-12-04-map.webp',
    './fig-2026-10-12-04-numbers.webp',
    './issue-010.html',
    './fig-2026-10-13-01-scale.webp',
    './fig-2026-10-13-01-lean.webp',
    './fig-2026-10-13-02-route.webp',
    './fig-2026-10-13-02-flow.webp',
    './fig-2026-10-13-03-cap.webp',
    './fig-2026-10-13-03-spark.webp',
    './fig-2026-10-13-04-map.webp',
    './fig-2026-10-13-04-num.webp',
    './issue-011.html',
    './fig-2026-10-14-01-route.webp',
    './fig-2026-10-14-01-pause.webp',
    './fig-2026-10-14-02-les.webp',
    './fig-2026-10-14-02-versions.webp',
    './fig-2026-10-14-03-numbers.webp',
    './fig-2026-10-14-03-heat.webp',
    './fig-2026-10-14-04-map.webp',
    './fig-2026-10-14-04-num.webp',
    './issue-012.html',
    './fig-2026-10-15-01-war.webp',
    './fig-2026-10-15-01-paths.webp',
    './fig-2026-10-15-02-params.webp',
    './fig-2026-10-15-02-claims.webp',
    './fig-2026-10-15-03-epic.webp',
    './fig-2026-10-15-03-model.webp',
    './fig-2026-10-15-04-map.webp',
    './fig-2026-10-15-04-num.webp',
    './issue-014.html',
    './fig-2026-10-17-01-ship.webp',
    './fig-2026-10-17-01-cost.webp',
    './fig-2026-10-17-02-loop.webp',
    './fig-2026-10-17-02-specs.webp',
    './fig-2026-10-17-03-profit.webp',
    './fig-2026-10-17-03-chain.webp',
    './fig-2026-10-17-04-map.webp',
    './fig-2026-10-17-04-num.webp',
    './issue-015.html',
    './fig-2026-10-18-01-trust.webp',
    './fig-2026-10-18-01-gap.webp',
    './fig-2026-10-18-02-dlm.webp',
    './fig-2026-10-18-02-peak.webp',
    './fig-2026-10-18-03-roi.webp',
    './fig-2026-10-18-03-price.webp',
    './fig-2026-10-18-04-cards.webp',
    './fig-2026-10-18-04-chain.webp',
    './issue-016.html',
    './fig-2026-10-19-01-boundary.webp',
    './fig-2026-10-19-01-prohibit.webp',
    './fig-2026-10-19-01-fields.webp',
    './fig-2026-10-19-01-logic.webp',
    './fig-2026-10-19-02-electron.webp',
    './fig-2026-10-19-02-spin.webp',
    './fig-2026-10-19-02-needle.webp',
    './fig-2026-10-19-02-timeline.webp',
    './fig-2026-10-19-03-mcp.webp',
    './fig-2026-10-19-03-share.webp',
    './fig-2026-10-19-03-fake.webp',
    './fig-2026-10-19-03-checklist.webp',
    './fig-2026-10-19-04-digest.webp',
    './fig-2026-10-19-04-rate.webp',
    './fig-2026-10-19-04-types.webp',
    './fig-2026-10-19-04-numbers.webp'
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
