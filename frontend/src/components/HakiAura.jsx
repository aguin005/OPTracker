import { useEffect, useRef } from "react";
import { strike } from "../haki";
import { useReducedMotion } from "../hooks";

// Wraps something in Conqueror's Haki: every few seconds red-and-black
// lightning crackles out of it. `intensity` runs from 0 (never) to 1 (every
// second or two, several bolts at a time).
export default function HakiAura({ intensity = 1, reach = 90, className = "", children }) {
  const host = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || intensity <= 0) return undefined;
    let timer;
    function schedule(wait) {
      timer = setTimeout(() => {
        strike(host.current, { bolts: 1 + Math.round(intensity * 3), reach });
        schedule((5600 - 4000 * intensity) * (0.6 + Math.random() * 0.8));
      }, wait);
    }
    schedule(400 + Math.random() * 900);
    return () => clearTimeout(timer);
  }, [reduced, intensity, reach]);

  return (
    <div className={`relative ${className}`}>
      {children}
      <span ref={host} aria-hidden="true" className="haki-host" />
    </div>
  );
}
