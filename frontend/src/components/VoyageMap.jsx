import { ArrowRight } from "lucide-react";
import { useId } from "react";
import { ARCS, kanjiNumber } from "../data";
import { Ship } from "./Scenery";
import { ProgressBar } from "./ui";

const INK = "#121212";
const PAPER = "#FBF8F2";
// Pale ink for islands still ahead. Drawn solid rather than see-through, so
// the route line passes behind them instead of showing across them.
const PALE = "#ABA597";

// Phones and tablets lay the islands out in rows of four, every other row
// running right to left so the route winds back like a board game path. From
// the lg breakpoint up (1024px, matching the CSS) they all fit on one line.
const NARROW_COLS = 4;
const WIDE_COLS = ARCS.length;

// Where island `index` sits in a layout `cols` wide, as a 1-based [column, row].
function spot(index, cols) {
  const row = Math.floor(index / cols);
  const step = index % cols;
  return [row % 2 === 0 ? step + 1 : cols - step, row + 1];
}

// Cleared islands are inked in solid black with a red flag, the next one is
// screentoned and circled in red, and the ones ahead are drawn in pale ink.
function Island({ arc, state, toneId, paleToneId }) {
  const Icon = arc.icon;
  const cleared = state === "cleared";
  const ink = state === "ahead" ? PALE : INK;
  return (
    <span className="island relative block">
      {state === "next" && <span className="island-ring motion-loop" />}
      <svg viewBox="0 0 64 56" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path d="M2 50 q8 -4 16 0 t16 0 t16 0 t14 0" fill="none" stroke={ink} strokeWidth="1.5" opacity="0.5" />
        <path
          d="M7 46 C11 29 20 15 32 13 C44 15 53 29 57 46 Z"
          fill={cleared ? INK : `url(#${state === "ahead" ? paleToneId : toneId})`}
          stroke={ink}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <ellipse cx="32" cy="45.5" rx="26" ry="6" fill={PAPER} stroke={ink} strokeWidth="2.5" />
      </svg>
      <Icon
        aria-hidden="true"
        className="absolute left-1/2 top-[48%] h-[36%] w-[31%] -translate-x-1/2 -translate-y-1/2"
        style={{ color: cleared ? PAPER : ink }}
        strokeWidth={2.5}
      />
      {cleared && (
        <svg viewBox="0 0 20 26" className="island-flag absolute" aria-hidden="true">
          <path d="M4 25 V3" stroke={INK} strokeWidth="2" strokeLinecap="round" />
          <path
            className="flag-cloth motion-loop"
            d="M5 3 L18 7.5 L5 12 Z"
            fill="#D3122A"
            stroke={INK}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}

// The dotted route for one layout, plus the red dashes already sailed: a line
// along each row of islands, and a drop at the row's end down to the next row.
function Route({ cols, sailedTo, className }) {
  const rows = Math.ceil(ARCS.length / cols);
  const x = (col) => ((col - 0.5) / cols) * 100;
  const y = (row) => `calc(${row} * (var(--row-h) + var(--row-gap)) + var(--lane) + var(--isl-h) / 2 - 1.5px)`;
  const pieces = [];

  for (let row = 0; row < rows; row++) {
    const first = row * cols;
    const last = Math.min(first + cols, ARCS.length) - 1;
    const [startCol] = spot(first, cols);
    const [endCol] = spot(last, cols);
    const reverse = row % 2 === 1;
    const along = (toCol) => ({ left: `${Math.min(x(startCol), x(toCol))}%`, width: `${Math.abs(x(toCol) - x(startCol))}%`, top: y(row) });

    pieces.push(
      <span key={`row${row}`} className={`route-dots motion-loop ${reverse ? "route-dots-reverse" : ""}`} style={along(endCol)} />
    );
    if (sailedTo > first) {
      pieces.push(<span key={`sailed${row}`} className="route-sailed" style={along(spot(Math.min(sailedTo, last), cols)[0])} />);
    }
    if (row < rows - 1) {
      pieces.push(
        <span
          key={`drop${row}`}
          className={sailedTo > last ? "route-drop route-drop-sailed" : "route-drop"}
          style={{ left: `calc(${x(endCol)}% - 1.5px)`, top: y(row), height: "calc(var(--row-h) + var(--row-gap))" }}
        />
      );
    }
  }

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`}>
      {pieces}
    </div>
  );
}

// The voyage as a chain of islands, one per arc, with the ship anchored at the
// first one you haven't finished and a card for that next stop underneath.
export default function VoyageMap({ watchedByArc, onSelectArc }) {
  // useId can include characters like ":" or "«" that don't survive inside url(#...).
  const toneId = `tone${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const paleToneId = `${toneId}pale`;

  const stops = ARCS.map((arc, index) => {
    const watched = watchedByArc[arc.id]?.length ?? 0;
    return { arc, index, watched, cleared: watched >= arc.episodes };
  });
  const nextIndex = stops.findIndex((stop) => !stop.cleared);
  const allClear = nextIndex === -1;
  const next = stops[allClear ? stops.length - 1 : nextIndex];
  const clearedCount = stops.filter((stop) => stop.cleared).length;

  const [shipColNarrow, shipRowNarrow] = spot(next.index, NARROW_COLS);
  const [shipColWide] = spot(next.index, WIDE_COLS);
  const shipPosition = {
    "--n-x": (shipColNarrow - 0.5) / NARROW_COLS,
    "--n-row": shipRowNarrow - 1,
    // On rows that run right to left, the ship turns around to face that way.
    "--n-flip": shipRowNarrow % 2 === 0 ? -1 : 1,
    "--w-x": (shipColWide - 0.5) / WIDE_COLS,
  };

  let note = next.arc.tagline;
  if (allClear) {
    note = next.arc.current
      ? `You're caught up. ${next.arc.name} is still airing, so more islands are on the way.`
      : "Every arc cleared.";
  }

  return (
    <div>
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <pattern id={toneId} width="5" height="5" patternUnits="userSpaceOnUse">
            <rect width="5" height="5" fill={PAPER} />
            <circle cx="2.5" cy="2.5" r="1" fill={INK} />
          </pattern>
          <pattern id={paleToneId} width="5" height="5" patternUnits="userSpaceOnUse">
            <rect width="5" height="5" fill={PAPER} />
            <circle cx="2.5" cy="2.5" r="0.9" fill={PALE} />
          </pattern>
        </defs>
      </svg>

      <div className="voyage-map" style={shipPosition}>
        <Route cols={NARROW_COLS} sailedTo={next.index} className="lg:hidden" />
        <Route cols={WIDE_COLS} sailedTo={next.index} className="hidden lg:block" />

        <div aria-hidden="true" className="voyage-ship">
          <div className="voyage-ship-turn">
            <div className="ship-bob motion-loop">
              <Ship className="h-auto w-full" />
            </div>
          </div>
        </div>

        <ol className="voyage-grid relative">
          {stops.map(({ arc, index, watched, cleared }) => {
            const state = cleared ? "cleared" : index === next.index ? "next" : "ahead";
            const [colNarrow, rowNarrow] = spot(index, NARROW_COLS);
            const [colWide] = spot(index, WIDE_COLS);
            return (
              <li key={arc.id} className="voyage-stop" style={{ "--cn": colNarrow, "--rn": rowNarrow, "--cw": colWide }}>
                <button
                  type="button"
                  onClick={() => onSelectArc(arc.id)}
                  title={arc.name}
                  aria-label={`${arc.name}, ${watched} of ${arc.episodes} episodes watched${cleared ? ", cleared" : ""}`}
                  className="island-button"
                >
                  <Island arc={arc} state={state} toneId={toneId} paleToneId={paleToneId} />
                </button>
                <span aria-hidden="true" className={`island-name ${state === "next" ? "island-name-next" : ""}`}>
                  {arc.short}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="mt-4 flex flex-col gap-4 border-t-2 border-dashed border-ink/25 pt-4 sm:flex-row sm:items-end">
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
