import { TOTAL_OMNIBUS, omnibusVolumes } from "../data";

// Owned spines cycle through these [background, text] pairs like a real shelf.
const SPINE_COLORS = [
  ["#E63946", "#FFF6DF"],
  ["#2E86AB", "#FFF6DF"],
  ["#F4C430", "#2B1D0E"],
  ["#3D8B8B", "#FFF6DF"],
  ["#8E5BB5", "#FFF6DF"],
  ["#E07A2E", "#2B1D0E"],
  ["#7EC8E3", "#2B1D0E"],
  ["#B8342E", "#FFF6DF"],
];

// The omnibus collection as book spines on wooden shelves. Owned ones are
// colored in, missing ones are dashed outlines.
export default function MangaShelf({ ownedOmnibus, onToggle }) {
  const owned = new Set(ownedOmnibus);

  return (
    <div className="shelf grid grid-cols-8 gap-x-1.5 sm:grid-cols-10 sm:gap-x-2 md:grid-cols-[repeat(13,minmax(0,1fr))] lg:grid-cols-[repeat(19,minmax(0,1fr))]">
      {Array.from({ length: TOTAL_OMNIBUS }, (_, i) => {
        const number = i + 1;
        const isOwned = owned.has(number);
        const volumes = omnibusVolumes(number);
        const [background, text] = SPINE_COLORS[i % SPINE_COLORS.length];
        return (
          <button
            key={number}
            type="button"
            onClick={(e) => onToggle(number, e.currentTarget)}
            title={`Omnibus ${number}, Volumes ${volumes.join("-")}`}
            aria-pressed={isOwned}
            className={`spine ${isOwned ? "spine-owned" : "spine-empty"}`}
            style={isOwned ? { "--spine": background, color: text } : undefined}
          >
            <span className="spine-number">{number}</span>
            <span className="spine-volumes">{volumes.join("·")}</span>
          </button>
        );
      })}
    </div>
  );
}
