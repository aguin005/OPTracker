import { ArrowRight } from "lucide-react";
import { ARCS, kanjiNumber } from "../data";
import { Ship } from "./Scenery";
import { ProgressBar } from "./ui";

// Written out in full so Tailwind sees these class names and keeps their styles.
const STOP_CLASS = { cleared: "stop-cleared", next: "stop-next", ahead: "stop-ahead" };

// The whole voyage on one line that fits any screen: a marker per arc (inked
// in once cleared, ringed in red for the next one, dashed for the rest) with
// the ship sailing above, then a card for the next stop.
export default function VoyageMap({ watchedByArc, onSelectArc }) {
  const stops = ARCS.map((arc, index) => {
    const watched = watchedByArc[arc.id]?.length ?? 0;
    return { arc, index, watched, cleared: watched >= arc.episodes };
  });
  const nextIndex = stops.findIndex((stop) => !stop.cleared);
  const allClear = nextIndex === -1;
  const next = stops[allClear ? stops.length - 1 : nextIndex];
  const clearedCount = stops.filter((stop) => stop.cleared).length;

  let note = next.arc.tagline;
  if (allClear) {
    note = next.arc.current
      ? `You're caught up. ${next.arc.name} is still airing, so more islands are on the way.`
      : "Every arc cleared.";
  }

  return (
    <div>
      <div className="voyage-route" style={{ "--at": next.index / (stops.length - 1) }}>
        <span aria-hidden="true" className="route-line" />
        <span aria-hidden="true" className="route-done" />
        <div aria-hidden="true" className="voyage-ship">
          <div className="ship-bob motion-loop">
            <Ship className="h-auto w-full" />
          </div>
        </div>

        <ol className="relative flex justify-between">
          {stops.map(({ arc, index, watched, cleared }) => {
            const state = cleared ? "cleared" : index === next.index ? "next" : "ahead";
            return (
              <li key={arc.id} className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => onSelectArc(arc.id)}
                  title={arc.name}
                  aria-label={`${arc.name}, ${watched} of ${arc.episodes} episodes watched${cleared ? ", cleared" : ""}`}
                  className={`stop ${STOP_CLASS[state]}`}
                />
                <span aria-hidden="true" className="stop-number font-brush">
                  {kanjiNumber(index + 1)}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-5 flex flex-col gap-4 border-t-2 border-dashed border-ink/25 pt-4 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-ink/55">
            {allClear ? "Voyage complete" : "Next stop"} · {clearedCount} of {stops.length} arcs cleared
          </p>
          <p className="mt-1.5 flex min-w-0 items-baseline gap-2">
            <span aria-hidden="true" className="shrink-0 font-brush text-sm text-ink/70">
              第{kanjiNumber(next.index + 1)}章
            </span>
            <span className="truncate font-display text-xl text-ink sm:text-2xl">{next.arc.name}</span>
          </p>
          <p className="mt-0.5 text-xs text-ink/60">{note}</p>
          {!allClear && (
            <div className="mt-3 flex items-center gap-3">
              <ProgressBar value={next.watched / next.arc.episodes} label={`${next.arc.name} progress`} className="flex-1" />
              <span className="shrink-0 font-mono text-xs text-ink/70">
                {next.watched} / {next.arc.episodes}
              </span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => onSelectArc(next.arc.id)}
          className="ink-button ink-button-small inline-flex items-center justify-center gap-2"
        >
          {allClear ? "Open" : next.watched > 0 ? "Continue" : "Start"}
          <ArrowRight aria-hidden="true" className="h-4 w-4" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
