// 서비스 워커: 앱 파일을 폰에 저장해 두고, 인터넷이 없어도 저장본으로 앱을 엶.
// ※ index.html 등을 수정해서 다시 올릴 때는 아래 버전 숫자를 올려야 폰에 새 버전이 반영됨.
const CACHE = 'todo-app-v2';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
  self.skipWaiting();
});

// 이전 버전 저장본 삭제
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// 저장본이 있으면 저장본을, 없으면 인터넷에서 가져옴
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((r) => r || fetch(e.request)));
});
