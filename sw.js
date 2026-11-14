/* Himanshu Electronics - minimal service worker (installable, never caches pages, shows phone number when offline). */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
var OFFLINE = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline - Himanshu Electronics</title></head><body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0b2147;color:#fff;font-family:Poppins,Arial,sans-serif;text-align:center;padding:24px"><div><h1 style="margin:0 0 8px">Himanshu Electronics</h1><p>You are offline. Please check your internet and try again.</p><p>Call <a href="tel:+919639228237" style="color:#ffc107;font-weight:700">9639228237</a></p></div></body></html>';
self.addEventListener('fetch', function (e) {
  if (e.request.mode !== 'navigate') return;
  e.respondWith(fetch(e.request).catch(function () { return new Response(OFFLINE, { headers: { 'Content-Type': 'text/html; charset=utf-8' } }); }));
});
