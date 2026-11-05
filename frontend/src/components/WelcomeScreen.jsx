import { useRef, useState } from "react";
import { bountyFor } from "../data";
import { TORN_EDGE } from "../poster";
import { MAX_NAME_LENGTH, readBackupFile } from "../storage";
import HakiAura from "./HakiAura";
import { JollyRoger, MangaScene, SpeedLines } from "./Scenery";

export default function WelcomeScreen({ onStart, onRestore }) {
  const [name, setName] = useState("");
  const [notice, setNotice] = useState(null);
  const backupInput = useRef(null);

  function handleSubmit(event) {
    event.preventDefault();
    if (name.trim()) onStart(name);
  }

  async function handleBackupPicked(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const backup = await readBackupFile(file);
      onRestore(backup);
      // A backup with progress but no name (like one saved from the old
      // server) still needs a name before the tracker can open.
      if (!backup.profile) setNotice({ text: "Backup loaded. Enter your name to continue." });
    } catch (err) {
      setNotice({ text: err.message, isError: true });
    }
  }

  return (
    <MangaScene className="min-h-screen min-h-svh" shipClassName="bottom-1 right-[2%] w-32 sm:right-[7%] sm:w-56">
      <main className="safe-x relative z-10 flex min-h-screen min-h-svh flex-col items-center pb-48 pt-8 text-center sm:pt-10">
        <HakiAura intensity={0.85} reach={140}>
          <h1 className="manga-title title-slam motion-once font-display uppercase" style={{ fontSize: "clamp(2.4rem, 9vw, 4.6rem)" }}>
            One Piece
            <br />
            Tracker
          </h1>
        </HakiAura>

        <form onSubmit={handleSubmit} className="mt-6 flex w-full max-w-[290px] flex-col items-center">
          <div className="poster-drop motion-once w-full">
            <div className="poster-shadow">
              <div className="poster-paper px-5 pb-5 pt-5 text-ink" style={{ clipPath: TORN_EDGE }}>
                <div className="relative">
                <p className="poster-wanted font-poster leading-none">WANTED</p>
                <div className="poster-photo relative mx-auto mt-3 grid aspect-[5/4] w-full place-items-center overflow-hidden">
                  <SpeedLines className="absolute inset-0 h-full w-full opacity-80" />
                  <div className="halftone-fade absolute inset-0" />
                  <JollyRoger size={104} className="relative" />
                </div>
                <p className="mt-3 font-poster text-sm tracking-[0.32em]">DEAD OR ALIVE</p>
                <label htmlFor="pirate-name" className="sr-only">
                  Your name
                </label>
                <input
                  id="pirate-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  maxLength={MAX_NAME_LENGTH}
                  autoComplete="name"
                  autoFocus
                  className="poster-input mt-1"
                />
                <p className="poster-bounty mt-2 font-poster leading-none">₿{bountyFor(0).toLocaleString()}-</p>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={!name.trim()} className="ink-button mt-7 w-full">
            Set sail!
          </button>
        </form>

        {notice && (
          <p
            className={`narration mt-4 ${notice.isError ? "narration-error" : ""}`}
          >
            {notice.text}
          </p>
        )}

        <p className="narration mt-5">
          Your progress stays saved in this browser.
        </p>
        <button
          type="button"
          onClick={() => backupInput.current?.click()}
          className="mt-2 bg-sheet px-3 py-1 text-sm font-bold text-ink underline decoration-2 underline-offset-4 transition-colors hover:bg-ink hover:text-sheet"
        >
          Restore from a backup
        </button>
        <input
          ref={backupInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleBackupPicked}
        />
      </main>
    </MangaScene>
  );
}
