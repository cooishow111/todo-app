// 서비스 워커: 앱 파일을 폰에 저장해 두고, 인터넷이 없어도 저장본으로 앱을 엶.
// ※ index.html 등을 수정해서 다시 올릴 때는 아래 CACHE 버전 숫자를 올려야 폰에 새 버전이 반영됨.
const CACHE = 'todo-app-v6';
// 글자 인식 엔진(버전 고정 파일)은 앱 버전과 따로 보관 → 앱을 업데이트해도 다시 내려받지 않음
const OCR_CACHE = 'ocr-engine-5.1.1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
  self.skipWaiting();
});

// 이전 버전 저장본 삭제 (인식 엔진 저장본은 유지)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE && k !== OCR_CACHE).map((k) => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // 글자 인식 엔진 파일: 처음 받을 때 저장, 이후엔 저장본 사용
  if (url.hostname === 'cdn.jsdelivr.net') {
    e.respondWith(caches.open(OCR_CACHE).then(async (c) => {
      const hit = await c.match(e.request);
      if (hit) return hit;
      const res = await fetch(e.request);
      if (res.ok) c.put(e.request, res.clone());
      return res;
    }));
    return;
  }

  // 앱 파일: 저장본이 있으면 저장본을, 없으면 인터넷에서 가져옴
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((r) => r || fetch(e.request)));
});
