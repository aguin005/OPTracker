import { Check, ChevronDown } from "lucide-react";
import { kanjiNumber } from "../data";
import EpisodeGrid from "./EpisodeGrid";
import { ProgressBar, Reveal } from "./ui";

// One arc as a manga panel: a black chapter strip down the left edge
// (第一章, 第二章, ...), the arc title, and a red 完 seal in place of the
// episode count once it's cleared.
// The header opens the episode grid, the round button marks the whole arc.
export default function ArcCard({ arc, index, watchedList, isOpen, onToggle, onMarkArc, onPaintEpisode }) {
  const watchedSet = new Set(watchedList);
  const count = watchedList.length;
  const cleared = count >= arc.episodes;
  const Icon = arc.icon;

  return (
    <Reveal as="article" id={`arc-${arc.id}`} delay={Math.min(index, 6) * 60} className="scroll-mt-6">
      <div className={`arc-panel relative ${isOpen ? "arc-panel-open" : ""}`}>
        <div className="flex items-stretch">
          <span aria-hidden="true" className="arc-chapter font-brush">
            第{kanjiNumber(index + 1)}章
          </span>

          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isOpen}
            aria-controls={`episodes-${arc.id}`}
            className="flex min-w-0 flex-1 items-center gap-2.5 py-3 pl-3 pr-1 text-left sm:gap-4 sm:py-4 sm:pl-4"
          >
            <span className="sr-only">Arc {index + 1}: </span>
            <span className="arc-icon grid shrink-0 place-items-center max-[359px]:hidden">
              <Icon aria-hidden="true" className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={2.5} />
            </span>

            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <span className="block truncate font-display text-base leading-tight text-ink sm:text-xl">{arc.name}</span>
                {arc.current && (
                  <span className="airing-badge shrink-0">
                    <span className="airing-dot motion-loop" />
                    Airing now
                  </span>
                )}
              </span>
              <span className="block truncate text-xs text-ink/60">{arc.tagline}</span>
              <ProgressBar value={count / arc.episodes} label={`${arc.name} progress`} className="mt-2" />
            </span>

            {cleared ? (
              <>
                <span aria-hidden="true" className="cleared-stamp ink-stamp shrink-0 font-brush">
                  完
                </span>
                <span className="sr-only">
                  {count} of {arc.episodes} episodes watched, cleared
                </span>
              </>
            ) : (
              <span className="shrink-0 text-right">
                <span className="block font-display text-lg leading-none text-ink">{count}</span>
                <span className="block font-mono text-[10px] text-ink/60">/ {arc.episodes}</span>
              </span>
            )}
            <ChevronDown
              aria-hidden="true"
              className={`hidden h-5 w-5 shrink-0 text-ink/50 transition-transform duration-300 sm:block ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          <div className="flex items-center pl-1 pr-2.5 sm:pr-4">
            <button
              type="button"
              onClick={() => onMarkArc(arc, !cleared)}
              aria-label={cleared ? `Mark ${arc.name} unwatched` : `Mark ${arc.name} fully watched`}
              title={cleared ? "Mark the whole arc unwatched" : "Mark the whole arc watched"}
              className={`mark-button grid h-10 w-10 place-items-center rounded-full ${cleared ? "mark-button-done" : ""}`}
            >
              <Check className="h-5 w-5" strokeWidth={3} />
            </button>
          </div>
        </div>

        {isOpen && (
          <div id={`episodes-${arc.id}`} className="episodes-panel motion-once border-t-[3px] border-ink px-3 pb-4 pt-3 sm:px-5">
            <EpisodeGrid arc={arc} watchedSet={watchedSet} onPaint={onPaintEpisode} />
          </div>
        )}
      </div>
    </Reveal>
  );
}
