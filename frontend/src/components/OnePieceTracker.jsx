import React, { useState, useMemo, useEffect } from "react";
import {
  Play, Check, BookOpen, LogOut, ChevronDown, Menu, Anchor,
  Waves, Sun, Zap, Ghost, Swords, Fish, Sparkles, Cake, Flame, Cpu, TreePine,
} from "lucide-react";
import { getProgress, toggleAnimeEpisode, setArcWatched, updateMangaProgress } from "../api";

// Static reference data, this doesn't come from the database, it's just the
// real shape of the show. Episode numbers here are absolute, chronological
// numbers matching what actually aired, not arc-relative counts, so Wano
// really does start at 890 and Elbaf really does start at 1156.
//
// Elbaf is still airing as of this writing (through episode 1172), bump its
// `episodes` count as new ones release.
const ARCS = [
  { id: "east-blue", name: "East Blue", start: 1, episodes: 61, accent: "#2E86AB", textOn: "#EFE1BA", tagline: "Where the journey begins", icon: Waves },
  { id: "alabasta", name: "Alabasta", start: 62, episodes: 74, accent: "#D4952B", textOn: "#241C10", tagline: "A kingdom buried in sand", icon: Sun },
  { id: "skypiea", name: "Sky Island", start: 136, episodes: 71, accent: "#7EC8E3", textOn: "#241C10", tagline: "Up among the clouds", icon: Zap },
  { id: "water7", name: "Water Seven / Enies Lobby", start: 207, episodes: 119, accent: "#4A7A96", textOn: "#EFE1BA", tagline: "Storm the gates of justice", icon: Waves },
  { id: "thriller-bark", name: "Thriller Bark", start: 326, episodes: 59, accent: "#6B4C7A", textOn: "#EFE1BA", tagline: "A haunted ghost ship", icon: Ghost },
  { id: "summit-war", name: "Summit War", start: 385, episodes: 132, accent: "#A62C2C", textOn: "#EFE1BA", tagline: "The war that changed everything", icon: Swords },
  { id: "fishman-island", name: "Fish-Man Island", start: 517, episodes: 58, accent: "#3D8B8B", textOn: "#EFE1BA", tagline: "Deep beneath the waves", icon: Fish },
  { id: "dressrosa", name: "Dressrosa Saga", start: 575, episodes: 172, accent: "#E0507A", textOn: "#EFE1BA", tagline: "Punk Hazard to a toy kingdom in chains", icon: Sparkles },
  { id: "whole-cake", name: "Whole Cake Island Saga", start: 747, episodes: 143, accent: "#E8A0BC", textOn: "#241C10", tagline: "Zou, tea parties, and a world council", icon: Cake },
  { id: "wano", name: "Wano Country", start: 890, episodes: 196, accent: "#B8342E", textOn: "#EFE1BA", tagline: "The land of samurai", icon: Flame },
  { id: "egghead", name: "Egghead", start: 1086, episodes: 70, accent: "#4FD1C5", textOn: "#241C10", tagline: "The future arrives early", icon: Cpu },
  { id: "elbaf", name: "Elbaf", start: 1156, episodes: 17, accent: "#8FBF5C", textOn: "#241C10", tagline: "Land of the giants", icon: TreePine, current: true },
];

const TOTAL_OMNIBUS = 38;
const VOLUMES_PER_OMNIBUS = 3;

function WaveDivider({ className = "" }) {
  return (
    <svg viewBox="0 0 400 20" preserveAspectRatio="none" className={className}>
      <path
        d="M0,10 Q25,0 50,10 T100,10 T150,10 T200,10 T250,10 T300,10 T350,10 T400,10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

export default function OnePieceTracker({ user, onLogout }) {
  const [loading, setLoading] = useState(true);
  const [watchedByArc, setWatchedByArc] = useState(() =>
    Object.fromEntries(ARCS.map((a) => [a.id, []]))
  );
  const [omnibusOwned, setOmnibusOwned] = useState(() =>
    Array.from({ length: TOTAL_OMNIBUS }, () => false)
  );
  const [expandedArc, setExpandedArc] = useState(null);
  const [dragPaint, setDragPaint] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    function endDrag() {
      setDragPaint(null);
    }
    window.addEventListener("pointerup", endDrag);
    return () => window.removeEventListener("pointerup", endDrag);
  }, []);

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
    () => Object.values(watchedByArc).reduce((s, list) => s + list.length, 0),
    [watchedByArc]
  );
  const omnibusCount = omnibusOwned.filter(Boolean).length;

  const animePct = episodesWatched / totalEpisodes;
  const mangaPct = omnibusCount / TOTAL_OMNIBUS;
  const overallPct = (animePct + mangaPct) / 2;
  const bounty = Math.round(overallPct * 999_000_000 + 1_000_000);

  // Every wanted poster gets "D" as the middle name, first and last name
  // come from the real Google profile, whatever's in between gets dropped.
  const nameParts = (user?.name || "Unknown Pirate").toUpperCase().split(" ").filter(Boolean);
  const posterName =
    nameParts.length <= 1
      ? [nameParts[0] || "UNKNOWN", "D"].join(" · ")
      : [nameParts[0], "D", nameParts[nameParts.length - 1]].join(" · ");

  function setEpisodeWatched(arcId, episodeNumber, watched) {
    setWatchedByArc((prev) => {
      const current = prev[arcId] || [];
      const isWatched = current.includes(episodeNumber);
      if (isWatched === watched) return prev;

      const next = watched
        ? [...current, episodeNumber]
        : current.filter((n) => n !== episodeNumber);

      toggleAnimeEpisode(arcId, episodeNumber, watched).catch((err) =>
        console.error("Failed to save anime progress", err)
      );

      return { ...prev, [arcId]: next };
    });
  }

  function startEpisodeDrag(arc, episodeNumber, currentlyWatched) {
    const paintValue = !currentlyWatched;
    setDragPaint({ arcId: arc.id, watched: paintValue });
    setEpisodeWatched(arc.id, episodeNumber, paintValue);
  }

  function continueEpisodeDrag(arc, episodeNumber) {
    if (!dragPaint || dragPaint.arcId !== arc.id) return;
    setEpisodeWatched(arc.id, episodeNumber, dragPaint.watched);
  }

  function markArc(arc, watched) {
    const next = watched
      ? Array.from({ length: arc.episodes }, (_, i) => arc.start + i)
      : [];
    setWatchedByArc((prev) => ({ ...prev, [arc.id]: next }));
    setArcWatched(arc.id, next).catch((err) => console.error("Failed to save arc progress", err));
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
    <div className="min-h-screen bg-[#0B2E44] text-[#EFE1BA] font-sans">
      <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-10">

        {/* Header */}
        <header className="relative pb-2">
          <div className="text-center px-14">
            <h1
              className="font-display tracking-tight uppercase leading-[0.95]"
              style={{ fontSize: "clamp(2.75rem, 7vw, 6.5rem)" }}
            >
              One Piece Tracker
            </h1>
          </div>

          <div className="absolute right-0 top-0">
            <button
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Menu"
              aria-expanded={menuOpen}
              className="p-2 text-[#EFE1BA]/60 hover:text-[#EFE1BA] transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-1 w-40 bg-[#EFE1BA] text-[#241C10] rounded-md shadow-xl overflow-hidden z-20">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-[#241C10]/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Ornamental divider */}
        <div className="flex items-center gap-3">
          <div
            className="flex-1 h-px"
            style={{ background: "linear-gradient(90deg, transparent, #D9A441 40%, #D9A441 60%, transparent)" }}
          />
          <Anchor className="w-4 h-4 text-[#D9A441] shrink-0" />
          <div
            className="flex-1 h-px"
            style={{ background: "linear-gradient(90deg, transparent, #D9A441 40%, #D9A441 60%, transparent)" }}
          />
        </div>

        {/* Wanted poster, doubles as the bounty display and the user's badge */}
        <section className="flex flex-col items-center">
          <div
            className="relative w-full max-w-[280px] sm:max-w-xs p-5 pt-4"
            style={{
              background: "radial-gradient(ellipse at 30% 15%, #F4E8CB, #E7D5A6 65%, #DBC488 100%)",
              border: "3px solid #241C10",
              boxShadow: "0 10px 28px rgba(0,0,0,0.45)",
            }}
          >
            {/* corner nail accents */}
            <span className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-[#241C10]/40" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#241C10]/40" />

            {/* inner frame line */}
            <div className="absolute inset-2 border border-[#241C10]/30 pointer-events-none" />

            <div className="relative text-center text-[#241C10]">
              <h2 className="font-display text-3xl tracking-[0.15em]">WANTED</h2>
              <div className="h-px bg-[#241C10]/70 mt-2" />
              <div className="h-px bg-[#241C10]/30 mt-1 mb-3" />

              {/* photo frame, the user's real Google avatar */}
              <div className="mx-auto w-32 h-32 sm:w-36 sm:h-36 border-2 border-[#241C10] bg-[#241C10]/10 overflow-hidden mb-3">
                {user?.avatarUrl && !avatarFailed ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="w-full h-full object-cover"
                    style={{ filter: "grayscale(1) sepia(0.2) contrast(1.1)" }}
                    onError={() => setAvatarFailed(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#241C10]/30 text-xs px-2 text-center">
                    no photo on file
                  </div>
                )}
              </div>

              <p className="text-xs tracking-[0.35em] uppercase mb-2">Dead or Alive</p>

              <p className="font-display text-lg sm:text-xl tracking-wide mb-2 leading-tight break-words">
                {posterName}
              </p>

              <p className="font-display tracking-tight" style={{ fontSize: "clamp(1.75rem, 6vw, 2.5rem)" }}>
                ₿{bounty.toLocaleString()}-
              </p>

              <p className="text-[10px] tracking-[0.4em] uppercase mt-3 opacity-50">Marine</p>
            </div>
          </div>

          {/* Compact stats, kept simple and out of the poster itself */}
          <div className="flex gap-10 mt-6">
            <div className="text-center">
              <p className="text-[#EFE1BA]/50 text-xs uppercase tracking-wide mb-1">Episodes watched</p>
              <p className="font-mono font-bold text-lg">{episodesWatched} / {totalEpisodes}</p>
            </div>
            <div className="text-center">
              <p className="text-[#EFE1BA]/50 text-xs uppercase tracking-wide mb-1">Omnibus owned</p>
              <p className="font-mono font-bold text-lg">{omnibusCount} / {TOTAL_OMNIBUS}</p>
            </div>
          </div>
        </section>

        {/* Anime log */}
        <section>
          <div className="flex items-center gap-2 mb-1">
            <Play className="w-5 h-5 text-[#D9A441]" />
            <h2
              className="font-display uppercase tracking-wide leading-none"
              style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)" }}
            >
              Anime Log
            </h2>
          </div>
          <div className="h-0.5 w-16 bg-[#D9A441] mb-3" />
          <p className="text-sm text-[#EFE1BA]/50 mb-4">
            Tap an arc to open it, then tap episodes as you watch them, or click and drag across a run of them at once.
          </p>

          <div className="space-y-2.5">
            {ARCS.map((arc) => {
              const watchedList = watchedByArc[arc.id] || [];
              const watchedSet = new Set(watchedList);
              const done = watchedList.length >= arc.episodes;
              const isOpen = expandedArc === arc.id;
              const ArcIcon = arc.icon;

              return (
                <div
                  key={arc.id}
                  style={{ "--accent": arc.accent }}
                  className="relative rounded-md border overflow-hidden transition-shadow duration-200 hover:shadow-[0_0_18px_-4px_var(--accent)]"
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1.5"
                    style={{ background: arc.accent, clipPath: "polygon(0 0, 100% 0, 40% 100%, 0 100%)" }}
                  />

                  <div
                    onClick={() => setExpandedArc(isOpen ? null : arc.id)}
                    className="w-full flex items-center gap-3 p-3 pl-5 cursor-pointer select-none border"
                    style={{
                      borderColor: `${arc.accent}40`,
                      background: isOpen ? `${arc.accent}14` : "transparent",
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markArc(arc, !done);
                      }}
                      aria-label={done ? `Mark ${arc.name} unwatched` : `Mark ${arc.name} fully watched`}
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 border transition-transform hover:scale-110"
                      style={{
                        backgroundColor: done ? arc.accent : "transparent",
                        borderColor: done ? arc.accent : "#EFE1BA55",
                      }}
                    >
                      {done && <Check className="w-4 h-4" style={{ color: arc.textOn }} />}
                    </button>

                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${arc.accent}22` }}
                    >
                      <ArcIcon className="w-4 h-4" style={{ color: arc.accent }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="font-medium truncate flex items-center gap-2">
                          {arc.name}
                          {arc.current && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#A32D2D] bg-[#EFE1BA] px-1.5 py-0.5 rounded-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#A32D2D] animate-pulse" />
                              Airing now
                            </span>
                          )}
                        </span>
                        <span className="text-xs font-mono shrink-0" style={{ color: arc.accent }}>
                          {watchedList.length}/{arc.episodes}
                        </span>
                      </div>
                      <p className="text-xs text-[#EFE1BA]/40 italic truncate">{arc.tagline}</p>
                    </div>

                    <ChevronDown
                      className={`w-4 h-4 text-[#EFE1BA]/40 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </div>

                  {isOpen && (
                    <div className="px-3 pb-3 pt-2" style={{ background: `${arc.accent}0A` }}>
                      <div
                        className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-14 gap-1 select-none"
                        style={{ touchAction: "none" }}
                      >
                        {Array.from({ length: arc.episodes }, (_, i) => arc.start + i).map((ep) => {
                          const watched = watchedSet.has(ep);
                          return (
                            <button
                              key={ep}
                              onPointerDown={(e) => {
                                e.preventDefault();
                                e.currentTarget.releasePointerCapture?.(e.pointerId);
                                startEpisodeDrag(arc, ep, watched);
                              }}
                              onPointerEnter={() => continueEpisodeDrag(arc, ep)}
                              title={`Episode ${ep}`}
                              style={{
                                "--accent": arc.accent,
                                backgroundColor: watched ? arc.accent : "transparent",
                                borderColor: watched ? arc.accent : "#EFE1BA22",
                                color: watched ? arc.textOn : "#EFE1BA55",
                                fontWeight: watched ? 700 : 400,
                              }}
                              className="h-7 rounded-sm text-[8px] font-mono flex items-center justify-center border transition-all hover:scale-110 hover:z-10 hover:shadow-[0_0_10px_var(--accent)] hover:border-[var(--accent)]"
                            >
                              {ep}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <WaveDivider className="w-full h-4 text-[#EFE1BA]/10" />

        {/* Manga log */}
        <section>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-[#D9A441]" />
            <h2
              className="font-display uppercase tracking-wide leading-none"
              style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)" }}
            >
              Manga Log
            </h2>
          </div>
          <div className="h-0.5 w-16 bg-[#D9A441] mb-3" />
          <p className="text-sm text-[#EFE1BA]/50 mb-4">Tap a spine to mark an omnibus as owned.</p>

          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5">
            {omnibusOwned.map((owned, i) => {
              const startVol = i * VOLUMES_PER_OMNIBUS + 1;
              const vols = Array.from({ length: VOLUMES_PER_OMNIBUS }, (_, j) => startVol + j);
              return (
                <button
                  key={i}
                  onClick={() => toggleOmnibus(i)}
                  title={`Omnibus ${i + 1}, Volumes ${vols.join("-")}`}
                  className={`h-16 rounded-sm border flex flex-col items-center justify-center gap-0.5 leading-none transition-all hover:scale-105 hover:-translate-y-0.5 ${
                    owned
                      ? "bg-[#D9A441] border-[#D9A441] text-[#241C10] hover:shadow-[0_0_14px_#D9A441]"
                      : "bg-transparent border-[#EFE1BA]/15 text-[#EFE1BA]/30 hover:border-[#D9A441]/50"
                  }`}
                >
                  <span className="text-xs font-bold">{i + 1}</span>
                  <span className="text-[8px] font-mono opacity-70">{vols.join("-")}</span>
                </button>
              );
            })}
          </div>
        </section>

        <footer className="text-center text-xs text-[#EFE1BA]/30 pt-4 border-t border-[#EFE1BA]/10">
          Progress saves automatically to your account.
        </footer>
      </div>
    </div>
  );
}