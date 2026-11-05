import { Check, ChevronDown } from "lucide-react";
import { arcEpisodes } from "../data";
import { ProgressBar, Reveal } from "./ui";

// One arc as an anime-style title card. The header opens the episode grid,
// the round button marks the whole arc, and cleared arcs get a red stamp.
export default function ArcCard({ arc, index, watchedList, isOpen, onToggle, onMarkArc, onEpisodePress, onEpisodeEnter }) {
  const watchedSet = new Set(watchedList);
  const count = watchedList.length;
  const cleared = count >= arc.episodes;
  const Icon = arc.icon;

  return (
    <Reveal as="article" id={`arc-${arc.id}`} delay={Math.min(index, 6) * 60} className="scroll-mt-6">
      <div className={`arc-card relative overflow-hidden ${isOpen ? "arc-card-open" : ""}`} style={{ "--accent": arc.accent }}>
        <span aria-hidden="true" className="arc-edge" />

        <div className="flex items-stretch">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isOpen}
            aria-controls={`episodes-${arc.id}`}
            className="flex min-w-0 flex-1 items-center gap-2.5 py-3 pl-4 pr-1 text-left sm:gap-4 sm:py-4 sm:pl-7"
          >
            <span className="arc-badge grid shrink-0 place-items-center" style={{ background: arc.accent, color: arc.textOn }}>
              <Icon aria-hidden="true" className="h-4 w-4 sm:h-6 sm:w-6" strokeWidth={2.5} />
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="font-sfx text-xs tracking-[0.2em] text-cream/50">ARC {String(index + 1).padStart(2, "0")}</span>
                {arc.current && (
                  <span className="airing-badge">
                    <span className="airing-dot motion-loop" />
                    Airing now
                  </span>
                )}
              </span>
              <span className="block truncate font-title text-lg leading-tight text-cream sm:text-2xl">{arc.name}</span>
              <span className="block truncate text-xs italic text-cream/50">{arc.tagline}</span>
              <ProgressBar value={count / arc.episodes} color={arc.accent} label={`${arc.name} progress`} className="mt-2" />
            </span>

            <span className="shrink-0 text-right">
              <span className="block font-title text-xl leading-none" style={{ color: arc.accent }}>
                {count}
              </span>
              <span className="block font-mono text-[10px] text-cream/50">/ {arc.episodes}</span>
            </span>
            <ChevronDown
              aria-hidden="true"
              className={`hidden h-5 w-5 shrink-0 text-cream/50 transition-transform duration-300 sm:block ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          <div className="flex items-center pl-1 pr-2.5 sm:pr-4">
            <button
              type="button"
              onClick={() => onMarkArc(arc, !cleared)}
              aria-label={cleared ? `Mark ${arc.name} unwatched` : `Mark ${arc.name} fully watched`}
              title={cleared ? "Mark the whole arc unwatched" : "Mark the whole arc watched"}
              className={`mark-button grid h-10 w-10 place-items-center rounded-full ${cleared ? "mark-button-done" : ""}`}
              style={cleared ? { background: arc.accent, color: arc.textOn } : undefined}
            >
              <Check className="h-5 w-5" strokeWidth={3} />
            </button>
          </div>
        </div>

        {cleared && (
          <span aria-hidden="true" className="cleared-stamp">
            Cleared!
          </span>
        )}

        {isOpen && (
          <div id={`episodes-${arc.id}`} className="episodes-panel motion-once px-3 pb-4 pt-1 sm:px-5">
            <div
              className="grid select-none grid-cols-8 gap-1.5 sm:grid-cols-10 md:grid-cols-[repeat(14,minmax(0,1fr))]"
              style={{ touchAction: "none" }}
            >
              {arcEpisodes(arc).map((ep) => {
                const watched = watchedSet.has(ep);
                return (
                  <button
                    key={ep}
                    type="button"
                    title={`Episode ${ep}`}
                    aria-pressed={watched}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.currentTarget.releasePointerCapture?.(e.pointerId);
                      onEpisodePress(arc, ep, watched, e.currentTarget, false);
                    }}
                    onPointerEnter={(e) => onEpisodeEnter(arc, ep, e.currentTarget)}
                    // Pointer presses are handled above. A click with no pointer
                    // behind it (detail 0) comes from the keyboard.
                    onClick={(e) => {
                      if (e.detail === 0) onEpisodePress(arc, ep, watched, e.currentTarget, true);
                    }}
                    className={`episode ${watched ? "episode-watched" : ""}`}
                    style={watched ? { background: arc.accent, color: arc.textOn } : undefined}
                  >
                    {ep}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Reveal>
  );
}
