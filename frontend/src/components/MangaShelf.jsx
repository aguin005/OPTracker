import { TOTAL_OMNIBUS, omnibusVolumes } from "../data";
import { JollyRoger } from "./Scenery";

// The omnibus collection as book spines on an ink-drawn shelf. Owned ones are
// inked in black with a skull at the top, missing ones are dashed outlines.
export default function MangaShelf({ ownedOmnibus, onToggle }) {
  const owned = new Set(ownedOmnibus);

  return (
    <div className="shelf grid grid-cols-8 gap-x-1.5 sm:grid-cols-10 sm:gap-x-2 md:grid-cols-[repeat(13,minmax(0,1fr))] lg:grid-cols-[repeat(19,minmax(0,1fr))]">
      {Array.from({ length: TOTAL_OMNIBUS }, (_, i) => {
        const number = i + 1;
        const isOwned = owned.has(number);
        const volumes = omnibusVolumes(number);
        return (
          <button
            key={number}
            type="button"
            onClick={(e) => onToggle(number, e.currentTarget)}
            title={`Omnibus ${number}, Volumes ${volumes.join("-")}`}
            aria-pressed={isOwned}
            className={`spine ${isOwned ? "spine-owned" : "spine-empty"}`}
          >
            <span className="spine-number">{number}</span>
            {isOwned && <JollyRoger size={16} ink="#FBF8F2" paper="#121212" />}
            <span className="spine-volumes">{volumes.join("·")}</span>
          </button>
        );
      })}
    </div>
  );
}
