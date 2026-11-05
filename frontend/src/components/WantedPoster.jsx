import { Pencil } from "lucide-react";
import { useCountUp } from "../hooks";
import { TORN_EDGE, posterName } from "../poster";
import { JollyRoger, SpeedLines } from "./Scenery";

// Longer names get smaller lettering so they still fit across the poster.
function nameSize(text) {
  if (text.length <= 12) return "1.6rem";
  if (text.length <= 16) return "1.35rem";
  if (text.length <= 20) return "1.15rem";
  return "1rem";
}

export default function WantedPoster({ name, bounty, rank, onRename }) {
  const shownBounty = useCountUp(bounty);
  const displayName = posterName(name);

  return (
    <div className="poster-drop motion-once relative mx-auto w-full max-w-[290px] pt-2">
      <span aria-hidden="true" className="poster-nail" />
      <div className="poster-sway motion-loop">
        <div className="poster-paper" style={{ clipPath: TORN_EDGE }}>
          <div className="px-5 pb-5 pt-5 text-center text-ink">
            <p className="poster-wanted font-poster leading-none">WANTED</p>
            <div className="poster-photo relative mx-auto mt-3 grid aspect-[5/4] w-full place-items-center overflow-hidden">
              <SpeedLines className="absolute inset-0 h-full w-full opacity-25" />
              <div className="halftone absolute inset-0 opacity-25" />
              <JollyRoger size={118} paper="#E2C88E" crowned={rank.at >= 1} className="relative" />
            </div>
            <p className="mt-3 font-poster text-sm tracking-[0.32em]">DEAD OR ALIVE</p>
            <button
              type="button"
              onClick={onRename}
              title="Change name"
              className="group relative mt-1 w-full font-poster leading-tight transition-colors hover:text-luffy"
              style={{ fontSize: nameSize(displayName) }}
            >
              <span className="break-words">{displayName}</span>
              <Pencil
                aria-hidden="true"
                className="absolute -right-1 top-1/2 h-4 w-4 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-60"
              />
            </button>
            <p className="poster-bounty mt-1 font-poster leading-none">₿{shownBounty.toLocaleString()}-</p>
            <p className="mt-3 font-poster text-[10px] tracking-[0.55em] opacity-60">MARINE</p>
          </div>
        </div>
        <span key={rank.title} className="rank-stamp motion-once">
          {rank.title}
        </span>
      </div>
    </div>
  );
}
