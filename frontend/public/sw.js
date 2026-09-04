/**
 * 오프라인은 "마지막 브리핑 화면만 캐시" 원칙 — 전체 오프라인 지원이 아니라
 * 홈 화면 진입 시 마지막으로 본 브리핑 셸이 보이는 정도의 최소 캐시.
 */
const CACHE_NAME = "stock-briefing-shell-v1";
const SHELL_URLS = ["/", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_URLS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // 네비게이션(HTML 셸)만 오프라인 폴백 대상 — API 응답은 항상 네트워크 우선.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("/", copy));
          return res;
        })
        .catch(() => caches.match("/"))
    );
  }
});
