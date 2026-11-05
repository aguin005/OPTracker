import { useEffect, useRef } from "react";
import { ARCS } from "../data";
import { useReducedMotion } from "../hooks";
import { Ship } from "./Scenery";

// Width of each island stop in px, matches the w-20 on each <li>.
const STOP = 80;
// Vertical middle of the islands, where the route line runs: the pt-16
// above them plus half of their h-14.
const ROUTE_Y = 64 + 28;

function Island({ arc, state }) {
  const Icon = arc.icon;
  return (
    <span className={`relative block h-14 w-16 ${state === "ahead" ? "island-ahead" : ""}`}>
      {state === "next" && <span className="island-ring motion-loop" />}
      <svg viewBox="0 0 64 56" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <ellipse cx="32" cy="47" rx="31" ry="8" fill="#FFFFFF" opacity="0.18" />
        <path
          d="M7 46 C11 29 20 15 32 13 C44 15 53 29 57 46 Z"
          fill={arc.accent}
          stroke="#2B1D0E"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <ellipse cx="32" cy="45.5" rx="26" ry="6" fill="#F1D9A0" stroke="#2B1D0E" strokeWidth="2.5" />
      </svg>
      <Icon
        aria-hidden="true"
        className="absolute left-1/2 top-[48%] h-5 w-5 -translate-x-1/2 -translate-y-1/2"
        style={{ color: arc.textOn }}
        strokeWidth={2.5}
      />
      {state === "cleared" && (
        <svg viewBox="0 0 20 26" className="absolute -top-3 right-1 h-6 w-5" aria-hidden="true">
          <path d="M4 25 V3" stroke="#2B1D0E" strokeWidth="2" strokeLinecap="round" />
          <path
            className="flag-cloth motion-loop"
            d="M5 3 L18 7.5 L5 12 Z"
            fill="#E63946"
            stroke="#2B1D0E"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}

// The route through every arc, with flags on the islands you've cleared and
// the ship anchored at the first one you haven't. Tapping an island opens it.
export default function VoyageMap({ watchedByArc, onSelectArc }) {
  const reduced = useReducedMotion();
  const scroller = useRef(null);

  const stops = ARCS.map((arc) => {
    const watched = watchedByArc[arc.id]?.length ?? 0;
    return { arc, watched, cleared: watched >= arc.episodes };
  });
  const nextIndex = stops.findIndex((stop) => !stop.cleared);
  const shipAt = nextIndex === -1 ? ARCS.length - 1 : nextIndex;

  // On narrow screens the route scrolls sideways, so keep the ship in view
  // by scrolling the route itself, never the page.
  useEffect(() => {
    const element = scroller.current;
    if (!element || element.scrollWidth <= element.clientWidth) return;
    const left = shipAt * STOP + STOP / 2 - element.clientWidth / 2;
    element.scrollTo({ left: Math.max(0, left), behavior: reduced ? "auto" : "smooth" });
  }, [shipAt, reduced]);

  return (
    <div ref={scroller} className="voyage-scroll -mx-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
      <div className="relative mx-auto w-max pt-16">
        <div
          aria-hidden="true"
          className="route-track motion-loop absolute h-2"
          style={{ top: ROUTE_Y - 4, left: STOP / 2, right: STOP / 2 }}
        />
        <div
          aria-hidden="true"
          className="route-progress absolute h-2"
          style={{ top: ROUTE_Y - 4, left: STOP / 2, width: shipAt * STOP }}
        />
        <div
          aria-hidden="true"
          className="voyage-ship absolute left-0 top-1 w-16"
          style={{ transform: `translateX(${shipAt * STOP + STOP / 2 - 32}px)` }}
        >
          <div className="ship-bob motion-loop">
            <Ship className="h-auto w-full" />
          </div>
        </div>

        <ol className="relative flex">
          {stops.map(({ arc, watched, cleared }, i) => (
            <li key={arc.id} className="flex w-20 shrink-0 flex-col items-center text-center">
              <button
                type="button"
                onClick={() => onSelectArc(arc.id)}
                aria-label={`${arc.name}, ${watched} of ${arc.episodes} episodes watched${cleared ? ", cleared" : ""}`}
                className="island-button"
              >
                <Island arc={arc} state={cleared ? "cleared" : i === shipAt ? "next" : "ahead"} />
              </button>
              <span className="mt-1.5 font-title text-[11px] leading-tight text-cream">{arc.short}</span>
              <span className="font-mono text-[10px] text-cream/60">
                {watched}/{arc.episodes}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
