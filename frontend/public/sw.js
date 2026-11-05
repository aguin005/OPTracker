// Service worker: once the tracker has been opened, it keeps opening and
// working with no connection, which matters most for the home screen app.
//
// - The page itself: network first, so a new version shows up whenever
//   you're online, with the copy saved last time as the offline fallback.
// - Built files in assets/: their names include a hash of their contents, so
//   a saved copy is always right. Copies the current page no longer uses are
//   cleared out each time a newer page is saved.
// - Icons, the manifest, and the Google Fonts stylesheet: answered from the
//   saved copy when there is one, and refreshed in the background.
// - Google Fonts font files never change, so each is saved once.

const APP_CACHE = "op-tracker-app-v1";
const FONT_CACHE = "op-tracker-fonts-v1";
const SHELL = new URL("./", self.registration.scope).href;

// Every ./file the page links to: the built script and styles, icons, manifest.
function filesLinkedFrom(html) {
  return [...html.matchAll(/(?:src|href)="(\.\/[^"]+)"/g)].map((match) => new URL(match[1], SHELL).href);
}

async function saveShell(response) {
  const cache = await caches.open(APP_CACHE);
  const html = await response.clone().text();
  await cache.put(SHELL, response);
  const linked = new Set(filesLinkedFrom(html));
  for (const request of await cache.keys()) {
    if (new URL(request.url).pathname.includes("/assets/") && !linked.has(request.url)) {
      await cache.delete(request);
    }
  }
  return linked;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const response = await fetch(SHELL, { cache: "no-cache" });
        if (response.ok) {
          const linked = await saveShell(response);
          await (await caches.open(APP_CACHE)).addAll([...linked]);
        }
      } catch {
        // No connection right now: files get saved as they're used instead.
      }
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) {
        if (key !== APP_CACHE && key !== FONT_CACHE) await caches.delete(key);
      }
      await self.clients.claim();
    })()
  );
});

async function networkFirst(event) {
  try {
    const response = await fetch(event.request);
    if (response.ok) event.waitUntil(saveShell(response.clone()));
    return response;
  } catch (err) {
    const saved = await caches.match(SHELL);
    if (saved) return saved;
    throw err;
  }
}

async function cacheFirst(request, cacheName) {
  const saved = await caches.match(request);
  if (saved) return saved;
  const response = await fetch(request);
  if (response.ok) await (await caches.open(cacheName)).put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(event, cacheName) {
  const saved = await caches.match(event.request);
  const refresh = fetch(event.request).then(async (response) => {
    if (response.ok) await (await caches.open(cacheName)).put(event.request, response.clone());
    return response;
  });
  if (saved) {
    event.waitUntil(refresh.catch(() => {}));
    return saved;
  }
  return refresh;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(event));
  } else if (url.origin === "https://fonts.gstatic.com") {
    event.respondWith(cacheFirst(request, FONT_CACHE));
  } else if (url.origin === "https://fonts.googleapis.com") {
    event.respondWith(staleWhileRevalidate(event, FONT_CACHE));
  } else if (url.origin === self.location.origin) {
    event.respondWith(url.pathname.includes("/assets/") ? cacheFirst(request, APP_CACHE) : staleWhileRevalidate(event, APP_CACHE));
  }
});
