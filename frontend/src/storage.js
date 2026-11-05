import { useEffect, useState } from "react";

// Everything the tracker remembers (your name and avatar plus anime and manga
// progress) is kept as one JSON blob under this key in the browser's
// localStorage. Nothing is sent anywhere, there's no account or server.
const STORAGE_KEY = "op-tracker";
const STORAGE_VERSION = 1;

export const MAX_NAME_LENGTH = 40;

// Arc ids are short slugs like "east-blue", anything else gets ignored.
const ARC_ID_PATTERN = /^[a-z0-9-]+$/;

export const byNumber = (a, b) => a - b;

export function emptyData() {
  return { profile: null, watchedByArc: {}, ownedOmnibus: [] };
}

export function createProfile(name) {
  return { name: name.trim().slice(0, MAX_NAME_LENGTH), avatarChoice: null, photo: null };
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function cleanNumberList(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((n) => Number.isInteger(n) && n > 0))].sort(byNumber);
}

function cleanProfile(raw) {
  if (!isPlainObject(raw) || typeof raw.name !== "string") return null;
  const profile = createProfile(raw.name);
  if (!profile.name) return null;
  if (typeof raw.avatarChoice === "string") profile.avatarChoice = raw.avatarChoice;
  // Inline images only, so an edited backup can't point the poster at another site.
  if (typeof raw.photo === "string" && raw.photo.startsWith("data:image/")) profile.photo = raw.photo;
  return profile;
}

// Turns whatever came out of localStorage or a backup file into the shape the
// app expects, dropping anything that doesn't fit. It also understands the
// { arcs: [{ arcId, watchedEpisodes }], ownedOmnibus } shape the old server's
// /api/progress endpoint returned, so progress saved there can be imported.
export function normalizeData(raw) {
  const data = emptyData();
  if (!isPlainObject(raw)) return data;

  data.profile = cleanProfile(raw.profile);

  const arcEntries = isPlainObject(raw.watchedByArc)
    ? Object.entries(raw.watchedByArc)
    : Array.isArray(raw.arcs)
      ? raw.arcs.map((arc) => [arc?.arcId, arc?.watchedEpisodes])
      : [];

  for (const [arcId, episodes] of arcEntries) {
    if (typeof arcId === "string" && ARC_ID_PATTERN.test(arcId)) {
      data.watchedByArc[arcId] = cleanNumberList(episodes);
    }
  }

  data.ownedOmnibus = cleanNumberList(raw.ownedOmnibus);
  return data;
}

function readSavedData() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? normalizeData(JSON.parse(saved)) : emptyData();
  } catch (err) {
    console.error("Couldn't read saved progress", err);
    return emptyData();
  }
}

function serialize(data, space) {
  return JSON.stringify({ version: STORAGE_VERSION, ...data }, null, space);
}

// Works like useState for the whole app's data, except it starts from what's
// in localStorage, writes every change back, and picks up changes saved by
// other open tabs so two tabs can't quietly overwrite each other.
export function useSavedData() {
  const [data, setData] = useState(readSavedData);

  useEffect(() => {
    try {
      const json = serialize(data);
      // Skipping identical writes keeps two open tabs from bouncing the same
      // change back and forth through the storage event below.
      if (window.localStorage.getItem(STORAGE_KEY) !== json) {
        window.localStorage.setItem(STORAGE_KEY, json);
      }
    } catch (err) {
      console.error("Couldn't save progress", err);
    }
  }, [data]);

  useEffect(() => {
    function handleStorage(event) {
      // A null key means another tab cleared localStorage entirely.
      if (event.key === STORAGE_KEY || event.key === null) setData(readSavedData());
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return [data, setData];
}

// False when the browser refuses to store anything for this page, for
// example when site data is blocked in its settings.
export function canUseStorage() {
  try {
    const probe = `${STORAGE_KEY}:probe`;
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export function downloadBackup(data) {
  const blob = new Blob([serialize(data, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `one-piece-tracker-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function readBackupFile(file) {
  const notABackup = new Error("That file isn't a One Piece Tracker backup.");
  let parsed;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    throw notABackup;
  }
  const knownKeys = ["profile", "watchedByArc", "arcs", "ownedOmnibus"];
  if (!isPlainObject(parsed) || !knownKeys.some((key) => key in parsed)) throw notABackup;
  return normalizeData(parsed);
}

// Phone photos run to several megabytes, far more than localStorage should
// hold, so the picked image is center-cropped to a small square JPEG first.
export function photoFileToDataUrl(file, size = 320) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (!img.naturalWidth || !img.naturalHeight) {
        reject(new Error("Couldn't read that image."));
        return;
      }
      const scale = Math.max(size / img.naturalWidth, size / img.naturalHeight);
      const width = img.naturalWidth * scale;
      const height = img.naturalHeight * scale;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#EFE1BA"; // shows through any transparent areas
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, (size - width) / 2, (size - height) / 2, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Couldn't read that image."));
    };
    img.src = url;
  });
}
