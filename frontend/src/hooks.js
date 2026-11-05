import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion() {
  return typeof window !== "undefined" && Boolean(window.matchMedia?.(REDUCED_MOTION).matches);
}

function subscribeToMotionPreference(callback) {
  const query = window.matchMedia?.(REDUCED_MOTION);
  query?.addEventListener("change", callback);
  return () => query?.removeEventListener("change", callback);
}

// True when the person has asked their device for less motion. Every
// animation in the app either checks this or is switched off in CSS.
export function useReducedMotion() {
  return useSyncExternalStore(subscribeToMotionPreference, prefersReducedMotion, () => false);
}

// Rolls a number toward `target` whenever it changes, like a bounty being
// rewritten on the poster. With reduced motion it just shows the target.
export function useCountUp(target, duration = 900) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(target);
  const current = useRef(target);

  useEffect(() => {
    if (reduced || current.current === target) return;
    const from = current.current;
    const startedAt = performance.now();
    let frame;

    function tick(now) {
      const t = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - (1 - t) ** 3;
      current.current = Math.round(from + (target - from) * eased);
      setShown(current.current);
      if (t < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration, reduced]);

  return reduced ? target : shown;
}

// Flips to true the first time the element scrolls into view, for
// entrance animations. Without IntersectionObserver it starts out true.
export function useInView() {
  const ref = useRef(null);
  const [inView, setInView] = useState(() => typeof IntersectionObserver === "undefined");

  useEffect(() => {
    const element = ref.current;
    if (inView || !element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [inView]);

  return [ref, inView];
}
