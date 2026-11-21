/* Ders Defteri: çevrimdışı açılış için basit önbellek */
const V = 'ders-defteri-v1';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  const font = u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com';
  if (u.origin !== location.origin && !font) return;
  if (font) {
    e.respondWith(caches.open(V).then(c => c.match(r).then(hit => {
      const net = fetch(r).then(res => { c.put(r, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    })));
    return;
  }
  e.respondWith(fetch(r).then(res => {
    const copy = res.clone();
    caches.open(V).then(c => c.put(r, copy));
    return res;
  }).catch(() => caches.match(r).then(hit => hit || caches.match('index.html'))));
});
