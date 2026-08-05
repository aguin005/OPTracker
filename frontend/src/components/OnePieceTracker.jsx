import React, { useState, useMemo, useEffect, useRef } from "react";
import { Compass, Play, Check, BookOpen, LogOut } from "lucide-react";
import { getProgress, updateAnimeProgress, updateMangaProgress } from "../api";

// Static reference data, this doesn't come from the database, it's just the
// shape of the show and the omnibus line. What the user has watched or
// owns does come from the database.
const ARCS = [
  { id: "east-blue", name: "East Blue", episodes: 61 },
  { id: "alabasta", name: "Alabasta", episodes: 74 },
  { id: "skypiea", name: "Skypiea", episodes: 71 },
  { id: "water7", name: "Water Seven / Enies Lobby", episodes: 119 },
  { id: "thriller-bark", name: "Thriller Bark", episodes: 59 },
  { id: "summit-war", name: "Summit War", episodes: 132 },
  { id: "fishman-island", name: "Fish-Man Island", episodes: 58 },
  { id: "dressrosa", name: "Dressrosa", episodes: 118 },
  { id: "whole-cake", name: "Whole Cake Island", episodes: 109 },
  { id: "wano", name: "Wano Country", episodes: 195 },
  { id: "egghead", name: "Egghead", episodes: 55 },
];

const TOTAL_OMNIBUS = 38;

export default function OnePieceTracker({ user, onLogout }) {
  const [loading, setLoading] = useState(true);
  const [watchedByArc, setWatchedByArc] = useState(() =>
    Object.fromEntries(ARCS.map((a) => [a.id, 0]))
  );
  const [omnibusOwned, setOmnibusOwned] = useState(() =>
    Array.from({ length: TOTAL_OMNIBUS }, () => false)
  );

  const debounceTimers = useRef({});

  // Pull the signed-in user's real progress on mount.
  useEffect(() => {
    let cancelled = false;

    getProgress()
      .then(({ arcs, ownedOmnibus }) => {
        if (cancelled) return;

        setWatchedByArc((prev) => {
          const next = { ...prev };
          arcs.forEach(({ arcId, watchedEpisodes }) => {
            next[arcId] = watchedEpisodes;
          });
          return next;
        });

        setOmnibusOwned(
          Array.from({ length: TOTAL_OMNIBUS }, (_, i) => ownedOmnibus.includes(i + 1))
        );
      })
      .catch((err) => console.error("Failed to load progress", err))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, []);

  const totalEpisodes = useMemo(() => ARCS.reduce((s, a) => s + a.episodes, 0), []);
  const episodesWatched = useMemo(
    () => Object.values(watchedByArc).reduce((s, n) => s + n, 0),
    [watchedByArc]
  );
  const omnibusCount = omnibusOwned.filter(Boolean).length;

  const animePct = episodesWatched / totalEpisodes;
  const mangaPct = omnibusCount / TOTAL_OMNIBUS;
  const overallPct = (animePct + mangaPct) / 2;

  const bounty = Math.round(overallPct * 999_000_000 + 1_000_000);
  const needleDeg = -90 + overallPct * 180;

  function setArcEpisodes(arcId, value, max) {
    const clamped = Math.max(0, Math.min(max, value));
    setWatchedByArc((prev) => ({ ...prev, [arcId]: clamped }));

    // Debounce so dragging the slider doesn't fire a request per pixel.
    clearTimeout(debounceTimers.current[arcId]);
    debounceTimers.current[arcId] = setTimeout(() => {
      updateAnimeProgress(arcId, clamped).catch((err) =>
        console.error("Failed to save anime progress", err)
      );
    }, 400);
  }

  function toggleOmnibus(index) {
    const omnibusNumber = index + 1;
    setOmnibusOwned((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      updateMangaProgress(omnibusNumber, next[index]).catch((err) =>
        console.error("Failed to save manga progress", err)
      );
      return next;
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F3652] text-[#EFE1BA] flex items-center justify-center">
        <p className="text-sm text-[#EFE1BA]/60">Charting your course…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F3652] text-[#EFE1BA] p-6 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex items-center justify-between border-b border-[#EFE1BA]/20 pb-6">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-[#D9A441] mb-1">Grand Line log</p>
            <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">One Piece Tracker</h1>
            <p className="text-sm text-[#EFE1BA]/60 mt-1">The dream doesn't end just because you fell behind on episodes.</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {user?.avatarUrl && (
              <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full border border-[#EFE1BA]/30" />
            )}
            <span className="text-sm text-[#EFE1BA]/70 hidden md:inline">{user?.name}</span>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-xs text-[#EFE1BA]/50 hover:text-[#EFE1BA] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Log out
            </button>
          </div>
        </header>

        {/* Bounty / Log Pose hero */}
        <section className="bg-[#EFE1BA] text-[#241C10] rounded-lg p-6 md:p-8 relative overflow-hidden">
          <div className="absolute inset-0 border-[10px] border-[#241C10]/5 pointer-events-none rounded-lg" />
          <div className="flex flex-col md:flex-row items-center gap-8">

            <div className="relative w-32 h-32 shrink-0">
              <svg viewBox="0 0 128 128" className="w-full h-full">
                <circle cx="64" cy="64" r="60" fill="none" stroke="#241C10" strokeWidth="2" opacity="0.5" />
                <circle cx="64" cy="64" r="52" fill="none" stroke="#241C10" strokeWidth="1" opacity="0.3" strokeDasharray="2 4" />
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                  <line
                    key={deg}
                    x1="64" y1="10" x2="64" y2="18"
                    stroke="#241C10"
                    strokeWidth="1.5"
                    opacity="0.4"
                    transform={`rotate(${deg} 64 64)`}
                  />
                ))}
                <g transform={`rotate(${needleDeg} 64 64)`} style={{ transition: "transform 0.6s ease-out" }}>
                  <polygon points="64,18 58,64 64,72 70,64" fill="#A32D2D" />
                  <polygon points="64,110 58,64 64,58 70,64" fill="#241C10" opacity="0.3" />
                </g>
                <circle cx="64" cy="64" r="5" fill="#241C10" />
              </svg>
              <Compass className="w-4 h-4 absolute top-0 right-0 text-[#1F6F63]" />
            </div>

            <div className="flex-1 text-center md:text-left">
              <p className="text-xs uppercase tracking-[0.25em] text-[#241C10]/60 mb-1">Current bounty</p>
              <p className="font-mono text-4xl md:text-5xl font-bold tabular-nums">
                ₿{bounty.toLocaleString()}
              </p>
              <div className="flex gap-6 mt-4 justify-center md:justify-start text-sm">
                <div>
                  <p className="text-[#241C10]/60">Episodes watched</p>
                  <p className="font-mono font-bold text-lg">{episodesWatched} / {totalEpisodes}</p>
                </div>
                <div>
                  <p className="text-[#241C10]/60">Omnibus owned</p>
                  <p className="font-mono font-bold text-lg">{omnibusCount} / {TOTAL_OMNIBUS}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Anime log */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Play className="w-5 h-5 text-[#D9A441]" />
            <h2 className="font-serif text-xl font-bold">Anime log</h2>
          </div>
          <div className="space-y-2">
            {ARCS.map((arc) => {
              const watched = watchedByArc[arc.id];
              const done = watched >= arc.episodes;
              const pct = watched / arc.episodes;
              return (
                <div
                  key={arc.id}
                  className={`rounded-md border p-3 flex items-center gap-3 ${
                    done ? "border-[#1F6F63] bg-[#1F6F63]/10" : "border-[#EFE1BA]/15"
                  }`}
                >
                  <button
                    onClick={() => setArcEpisodes(arc.id, done ? 0 : arc.episodes, arc.episodes)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                      done ? "bg-[#1F6F63] border-[#1F6F63]" : "border-[#EFE1BA]/40"
                    }`}
                    aria-label={done ? `Mark ${arc.name} unwatched` : `Mark ${arc.name} fully watched`}
                  >
                    {done && <Check className="w-4 h-4 text-[#EFE1BA]" />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium truncate">{arc.name}</span>
                      <span className="text-[#EFE1BA]/50 font-mono">{watched}/{arc.episodes}</span>
                    </div>
                    <div className="h-1.5 bg-[#EFE1BA]/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#D9A441] rounded-full"
                        style={{ width: `${pct * 100}%`, transition: "width 0.4s ease-out" }}
                      />
                    </div>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={arc.episodes}
                    value={watched}
                    onChange={(e) => setArcEpisodes(arc.id, Number(e.target.value), arc.episodes)}
                    className="w-24 accent-[#D9A441] hidden md:block"
                  />
                </div>
              );
            })}
          </div>
        </section>

        {/* Manga log */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-[#D9A441]" />
            <h2 className="font-serif text-xl font-bold">Manga log, omnibus shelf</h2>
          </div>
          <p className="text-sm text-[#EFE1BA]/50 mb-3">Tap a spine to mark an omnibus as owned.</p>
          <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-13 gap-1.5">
            {omnibusOwned.map((owned, i) => (
              <button
                key={i}
                onClick={() => toggleOmnibus(i)}
                title={`Omnibus ${i + 1}`}
                className={`h-14 rounded-sm border text-[10px] font-mono flex items-end justify-center pb-1 ${
                  owned
                    ? "bg-[#D9A441] border-[#D9A441] text-[#241C10] font-bold"
                    : "bg-transparent border-[#EFE1BA]/15 text-[#EFE1BA]/30"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </section>

        <footer className="text-center text-xs text-[#EFE1BA]/30 pt-4 border-t border-[#EFE1BA]/10">
          Progress saves automatically to your account.
        </footer>
      </div>
    </div>
  );
}