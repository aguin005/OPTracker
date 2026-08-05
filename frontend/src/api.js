const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include", // sends the session cookie, required for auth to work
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok && res.status !== 401) {
    throw new Error(`Request to ${path} failed with status ${res.status}`);
  }

  return res.json();
}

export function getCurrentUser() {
  return request("/auth/me");
}

export function logout() {
  return request("/auth/logout", { method: "POST" });
}

export function getProgress() {
  return request("/api/progress");
}

export function toggleAnimeEpisode(arcId, episodeNumber, watched) {
  return request("/api/progress/anime", {
    method: "PATCH",
    body: JSON.stringify({ arcId, episodeNumber, watched }),
  });
}

export function setArcWatched(arcId, watchedEpisodes) {
  return request("/api/progress/anime/bulk", {
    method: "PATCH",
    body: JSON.stringify({ arcId, watchedEpisodes }),
  });
}

export function updateMangaProgress(omnibusNumber, owned) {
  return request("/api/progress/manga", {
    method: "PATCH",
    body: JSON.stringify({ omnibusNumber, owned }),
  });
}

export function googleLoginUrl() {
  return `${API_URL}/auth/google`;
}