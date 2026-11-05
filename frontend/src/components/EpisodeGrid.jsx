import { useEffect, useRef, useState } from "react";
import { arcEpisodes } from "../data";

// How long a finger has to rest on an episode before dragging paints, and how
// far it can wander before that counts as a scroll instead.
const HOLD_MS = 350;
const MOVE_SLOP = 10;

// The episode buttons for one arc, with every way of marking them:
//  - mouse or pen: press and drag across a run to paint it, like before
//  - finger: tap to toggle, swipe to scroll the page as usual, or press and
//    hold for a moment and then drag to paint a run
//  - keyboard: Enter or Space toggles the focused episode
// `onPaint(arc, episode, watched, element)` sets one episode to `watched`.
export default function EpisodeGrid({ arc, watchedSet, onPaint }) {
  const grid = useRef(null);
  const gesture = useRef(null);
  const [painting, setPainting] = useState(false);

  // Once a held finger starts painting, keep the page from scrolling under it.
  useEffect(() => {
    const element = grid.current;
    function holdPage(event) {
      if (gesture.current?.painting) event.preventDefault();
    }
    element.addEventListener("touchmove", holdPage, { passive: false });
    return () => element.removeEventListener("touchmove", holdPage);
  }, []);

  function tileFrom(target) {
    const tile = target?.closest?.("[data-ep]");
    return tile && grid.current?.contains(tile) ? tile : null;
  }

  function startPainting(g) {
    g.painting = true;
    g.last = g.ep;
    setPainting(true);
    onPaint(arc, g.ep, g.value, g.tile);
  }

  function handlePointerDown(event) {
    const tile = tileFrom(event.target);
    if (!tile || (event.pointerType === "mouse" && event.button !== 0)) return;
    const ep = Number(tile.dataset.ep);
    const g = { id: event.pointerId, ep, tile, x: event.clientX, y: event.clientY, value: !watchedSet.has(ep), painting: false };
    gesture.current = g;

    if (event.pointerType === "touch") {
      // This might be the start of a scroll, so wait to see if the finger stays put.
      g.timer = setTimeout(() => {
        if (gesture.current === g) startPainting(g);
      }, HOLD_MS);
    } else {
      event.preventDefault();
      // Keep getting events even if the pointer leaves the grid mid-drag.
      grid.current.setPointerCapture?.(event.pointerId);
      startPainting(g);
    }
  }

  function handlePointerMove(event) {
    const g = gesture.current;
    if (!g || g.id !== event.pointerId) return;
    if (!g.painting) {
      if (Math.hypot(event.clientX - g.x, event.clientY - g.y) > MOVE_SLOP) {
        clearTimeout(g.timer);
        gesture.current = null;
      }
      return;
    }
    const tile = tileFrom(document.elementFromPoint(event.clientX, event.clientY));
    if (!tile) return;
    const ep = Number(tile.dataset.ep);
    if (ep === g.last) return;
    g.last = ep;
    if (watchedSet.has(ep) !== g.value) onPaint(arc, ep, g.value, tile);
  }

  function handlePointerEnd(event) {
    const g = gesture.current;
    if (!g || g.id !== event.pointerId) return;
    clearTimeout(g.timer);
    gesture.current = null;
    setPainting(false);
    // A quick tap with a finger toggles the episode it landed on. A cancel
    // means the browser took the touch over to scroll, so nothing changes.
    if (event.type === "pointerup" && !g.painting) onPaint(arc, g.ep, g.value, g.tile);
  }

  return (
    <div
      ref={grid}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onContextMenu={(event) => event.preventDefault()}
      className={`episode-grid grid grid-cols-8 gap-1.5 sm:grid-cols-10 md:grid-cols-[repeat(14,minmax(0,1fr))] ${
        painting ? "episode-grid-painting" : ""
      }`}
    >
      {arcEpisodes(arc).map((ep) => {
        const watched = watchedSet.has(ep);
        return (
          <button
            key={ep}
            type="button"
            data-ep={ep}
            title={`Episode ${ep}`}
            aria-pressed={watched}
            // Pointers are handled on the grid above. A click with no pointer
            // behind it (detail 0) comes from the keyboard.
            onClick={(event) => {
              if (event.detail === 0) onPaint(arc, ep, !watched, event.currentTarget);
            }}
            className={`episode ${watched ? "episode-watched" : ""}`}
          >
            {ep}
          </button>
        );
      })}
    </div>
  );
}
