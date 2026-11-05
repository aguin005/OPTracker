import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Download, Menu, Pencil, RotateCcw, ScrollText, TriangleAlert, Upload } from "lucide-react";
import { ARCS, TOTAL_EPISODES, TOTAL_OMNIBUS, arcEpisodes, bountyFor, rankFor } from "../data";
import { celebrate, pop } from "../effects";
import { useReducedMotion } from "../hooks";
import { MAX_NAME_LENGTH, byNumber, canUseStorage, downloadBackup, emptyData, readBackupFile } from "../storage";
import ArcCard from "./ArcCard";
import HakiAura from "./HakiAura";
import MangaShelf from "./MangaShelf";
import { MangaScene } from "./Scenery";
import { Modal, ProgressBar, Reveal, SectionTitle } from "./ui";
import VoyageMap from "./VoyageMap";
import WantedPoster from "./WantedPoster";

function MenuItem({ icon: Icon, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-bold transition-colors hover:bg-ink hover:text-sheet"
    >
      <Icon className="h-4 w-4" strokeWidth={2.5} />
      {children}
    </button>
  );
}

function Stat({ label, value, progress }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-ink/60">{label}</span>
        <span className="font-display text-xl text-ink">{value}</span>
      </div>
      <ProgressBar value={progress} label={label} className="mt-1.5" />
    </div>
  );
}

// How long after a tap a newly finished arc still counts as "you just did
// that", so imports and changes from other tabs don't set off celebrations.
const CELEBRATION_WINDOW_MS = 1500;

// `data` is everything saved in this browser (see storage.js), and every
// change goes through `setData`, which writes it back to localStorage.
export default function OnePieceTracker({ data, setData }) {
  const { profile, watchedByArc, ownedOmnibus } = data;
  const reduced = useReducedMotion();

  const [expandedArc, setExpandedArc] = useState(null);
  const [dragPaint, setDragPaint] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [canSave] = useState(canUseStorage);
  const backupInput = useRef(null);
  const lastEditAt = useRef(-Infinity);
  const previous = useRef(null);

  useEffect(() => {
    function endDrag() {
      setDragPaint(null);
    }
    window.addEventListener("pointerup", endDrag);
    return () => window.removeEventListener("pointerup", endDrag);
  }, []);

  const episodesWatched = ARCS.reduce((sum, arc) => sum + (watchedByArc[arc.id]?.length ?? 0), 0);
  const omnibusCount = ownedOmnibus.filter((n) => n <= TOTAL_OMNIBUS).length;
  const animeProgress = episodesWatched / TOTAL_EPISODES;
  const mangaProgress = omnibusCount / TOTAL_OMNIBUS;
  const overall = (animeProgress + mangaProgress) / 2;
  const rank = rankFor(overall);

  useEffect(() => {
    const counts = Object.fromEntries(ARCS.map((arc) => [arc.id, watchedByArc[arc.id]?.length ?? 0]));
    const before = previous.current;
    previous.current = { counts, omnibusCount, overall };
    if (!before || performance.now() - lastEditAt.current > CELEBRATION_WINDOW_MS) return;

    if (overall >= 1 && before.overall < 1) {
      celebrate({ subtitle: "King of the Pirates!" });
      return;
    }
    const cleared = ARCS.find((arc) => before.counts[arc.id] < arc.episodes && counts[arc.id] >= arc.episodes);
    if (cleared) {
      celebrate({ subtitle: `${cleared.name} cleared!` });
    } else if (omnibusCount >= TOTAL_OMNIBUS && before.omnibusCount < TOTAL_OMNIBUS) {
      celebrate({ subtitle: "Every omnibus collected!" });
    }
  }, [watchedByArc, omnibusCount, overall]);

  function markEdited() {
    lastEditAt.current = performance.now();
  }

  function setEpisodeWatched(arcId, episodeNumber, watched) {
    markEdited();
    setData((prev) => {
      const current = prev.watchedByArc[arcId] || [];
      if (current.includes(episodeNumber) === watched) return prev;
      const next = watched
        ? [...current, episodeNumber].sort(byNumber)
        : current.filter((n) => n !== episodeNumber);
      return { ...prev, watchedByArc: { ...prev.watchedByArc, [arcId]: next } };
    });
  }

  function pressEpisode(arc, episodeNumber, watched, element, fromKeyboard) {
    if (!fromKeyboard) setDragPaint({ arcId: arc.id, watched: !watched });
    setEpisodeWatched(arc.id, episodeNumber, !watched);
    pop(element);
  }

  function dragOverEpisode(arc, episodeNumber, element) {
    if (!dragPaint || dragPaint.arcId !== arc.id) return;
    if ((watchedByArc[arc.id] || []).includes(episodeNumber) === dragPaint.watched) return;
    setEpisodeWatched(arc.id, episodeNumber, dragPaint.watched);
    pop(element, 1.2);
  }

  function markArc(arc, watched) {
    markEdited();
    const next = watched ? arcEpisodes(arc) : [];
    setData((prev) => ({ ...prev, watchedByArc: { ...prev.watchedByArc, [arc.id]: next } }));
  }

  function toggleOmnibus(omnibusNumber, element) {
    markEdited();
    setData((prev) => {
      const owned = prev.ownedOmnibus.includes(omnibusNumber);
      const next = owned
        ? prev.ownedOmnibus.filter((n) => n !== omnibusNumber)
        : [...prev.ownedOmnibus, omnibusNumber].sort(byNumber);
      return { ...prev, ownedOmnibus: next };
    });
    pop(element, 1.12);
  }

  function openArcFromMap(arcId) {
    // Apply the open/close first: if an arc above was open, closing it moves
    // everything up, and the scroll has to aim at where the card ends up.
    flushSync(() => setExpandedArc(arcId));
    document.getElementById(`arc-${arcId}`)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }

  function saveName(event) {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get("name") ?? "").trim();
    if (!name) return;
    setData((prev) => ({ ...prev, profile: { ...prev.profile, name } }));
    setRenameOpen(false);
  }

  function openRename() {
    setMenuOpen(false);
    setRenameOpen(true);
  }

  function exportBackup() {
    setMenuOpen(false);
    downloadBackup(data);
  }

  function chooseBackupFile() {
    setMenuOpen(false);
    backupInput.current?.click();
  }

  async function handleBackupPicked(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const backup = await readBackupFile(file);
      if (!window.confirm("Replace everything tracked in this browser with this backup?")) return;
      // A backup with progress only (like one saved from the old server)
      // keeps the name you already have here.
      setData((prev) => ({ ...backup, profile: backup.profile ?? prev.profile }));
    } catch (err) {
      window.alert(err.message);
    }
  }

  function startOver() {
    setMenuOpen(false);
    const confirmed = window.confirm(
      "This erases your name and every episode and omnibus tracked in this browser. " +
        "Export a backup first if you might want them back.\n\nStart over?"
    );
    if (confirmed) setData(emptyData());
  }

  return (
    <div className="paper-page min-h-screen text-ink">
      <header className="relative border-b-4 border-ink">
        <MangaScene className="h-[400px] sm:h-[480px]" shipClassName="bottom-1 left-[3%] w-36 sm:left-[8%] sm:w-56">
          <div className="relative z-10 flex flex-col items-center px-4 pt-14 text-center sm:pt-16">
            <span className="title-caption motion-once">Grand voyage log</span>
            <HakiAura intensity={0.85} reach={150} className="mt-4">
              <h1 className="manga-title title-slam motion-once font-display uppercase" style={{ fontSize: "clamp(2.9rem, 11vw, 6.6rem)" }}>
                One Piece
                <br />
                Tracker
              </h1>
            </HakiAura>
          </div>
        </MangaScene>

        <div className="absolute right-3 top-3 z-30 sm:right-6 sm:top-6">
          <button
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className="menu-button relative z-20 grid h-12 w-12 place-items-center"
          >
            <Menu className="h-6 w-6" strokeWidth={2.75} />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="menu-card motion-once absolute right-0 z-20 mt-2 w-52 overflow-hidden py-1">
                <MenuItem icon={Pencil} onClick={openRename}>Change name</MenuItem>
                <MenuItem icon={Download} onClick={exportBackup}>Export backup</MenuItem>
                <MenuItem icon={Upload} onClick={chooseBackupFile}>Import backup</MenuItem>
                <MenuItem icon={RotateCcw} onClick={startOver}>Start over</MenuItem>
              </div>
            </>
          )}
        </div>
      </header>

      <main className="relative">
        <div className="mx-auto max-w-5xl space-y-16 px-4 pb-14 pt-12 sm:px-6">
          {!canSave && (
            <div className="panel flex items-start gap-2 border-haki px-4 py-3 text-sm font-bold">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-haki" strokeWidth={2.5} />
              <p>
                This browser is blocking site storage, so your progress will be lost when you close this page.
                Allow site data for this page to keep it.
              </p>
            </div>
          )}

          <section className="grid items-center gap-12 md:grid-cols-[300px_minmax(0,1fr)] md:gap-14">
            <WantedPoster
              name={profile.name}
              bounty={bountyFor(overall)}
              rank={rank}
              onRename={() => setRenameOpen(true)}
            />

            <Reveal className="panel">
              <div className="panel-header flex items-center gap-2 px-5 py-3">
                <ScrollText className="h-5 w-5" strokeWidth={2.5} />
                <h2 className="font-display text-lg uppercase tracking-wide">Captain's Log</h2>
                <span aria-hidden="true" className="ml-auto font-brush text-lg">
                  航海日誌
                </span>
              </div>
              <div className="space-y-5 p-5">
                <Stat label="Episodes watched" value={`${episodesWatched} / ${TOTAL_EPISODES}`} progress={animeProgress} />
                <Stat label="Omnibus owned" value={`${omnibusCount} / ${TOTAL_OMNIBUS}`} progress={mangaProgress} />
                <div className="rank-box px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-ink/60">
                    Rank · {Math.floor(overall * 100)}% of the voyage
                  </p>
                  <p className="mt-1 font-display text-2xl text-ink">{rank.title}</p>
                  <p className="mt-1 text-xs text-ink/70">
                    {rank.next
                      ? `Next up: ${rank.next.title} at ${Math.round(rank.next.at * 100)}%. Your haki grows with every rank.`
                      : "Every episode and every volume. The whole voyage is yours."}
                  </p>
                </div>
              </div>
            </Reveal>
          </section>

          <section>
            <SectionTitle
              title="The Voyage"
              kanji="航路"
              subtitle="Your ship anchors at the first arc you haven't finished. Tap an island to jump to it."
            />
            <Reveal className="panel px-2 pt-2 sm:px-4">
              <VoyageMap watchedByArc={watchedByArc} onSelectArc={openArcFromMap} />
            </Reveal>
          </section>

          <section>
            <SectionTitle
              title="Anime Log"
              kanji="アニメ"
              subtitle="Open an arc and tap episodes as you watch them, or drag across a run of them at once."
            />
            <div className="space-y-4">
              {ARCS.map((arc, i) => (
                <ArcCard
                  key={arc.id}
                  arc={arc}
                  index={i}
                  watchedList={watchedByArc[arc.id] || []}
                  isOpen={expandedArc === arc.id}
                  onToggle={() => setExpandedArc(expandedArc === arc.id ? null : arc.id)}
                  onMarkArc={markArc}
                  onEpisodePress={pressEpisode}
                  onEpisodeEnter={dragOverEpisode}
                />
              ))}
            </div>
          </section>

          <section>
            <SectionTitle title="Manga Log" kanji="単行本" subtitle="Tap a spine to put that omnibus on your shelf." />
            <Reveal className="panel px-3 pt-4 sm:px-5">
              <MangaShelf ownedOmnibus={ownedOmnibus} onToggle={toggleOmnibus} />
            </Reveal>
          </section>

          <footer className="border-t-[3px] border-ink pt-6 text-center text-xs text-ink/60">
            <p>
              Progress saves automatically in this browser. Export a backup from the menu to keep a copy or move it to
              another device.
            </p>
            <p className="mt-1">Unofficial fan-made tracker.</p>
          </footer>
        </div>
      </main>

      {renameOpen && (
        <Modal title="Change your name" onClose={() => setRenameOpen(false)}>
          <form onSubmit={saveName} className="space-y-6">
            <input
              name="name"
              defaultValue={profile.name}
              maxLength={MAX_NAME_LENGTH}
              required
              autoFocus
              aria-label="Your name"
              className="poster-input"
            />
            <button type="submit" className="ink-button w-full">
              Save
            </button>
          </form>
        </Modal>
      )}

      <input
        ref={backupInput}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleBackupPicked}
      />
    </div>
  );
}
