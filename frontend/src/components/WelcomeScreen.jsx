import { useRef, useState } from "react";
import { bountyFor } from "../data";
import { TORN_EDGE } from "../poster";
import { MAX_NAME_LENGTH, readBackupFile } from "../storage";
import { JollyRoger, SeaScene, SpeedLines } from "./Scenery";

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
    <SeaScene className="min-h-screen" shipClassName="bottom-3 right-[2%] w-32 sm:right-[7%] sm:w-56">
      <main className="relative z-10 flex min-h-screen flex-col items-center px-4 pb-48 pt-8 text-center sm:pt-10">
        <h1 className="anime-title title-pop motion-once font-title uppercase" style={{ fontSize: "clamp(2.6rem, 10vw, 5rem)" }}>
          One Piece
          <br />
          Tracker
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 flex w-full max-w-[290px] flex-col items-center">
          <div className="poster-drop motion-once w-full">
            <div className="poster-shadow">
              <div className="poster-paper px-5 pb-5 pt-5 text-ink" style={{ clipPath: TORN_EDGE }}>
                <p className="poster-wanted font-poster leading-none">WANTED</p>
                <div className="poster-photo relative mx-auto mt-3 grid aspect-[5/4] w-full place-items-center overflow-hidden">
                  <SpeedLines className="absolute inset-0 h-full w-full opacity-25" />
                  <div className="halftone absolute inset-0 opacity-25" />
                  <JollyRoger size={104} paper="#E2C88E" className="relative" />
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

          <button type="submit" disabled={!name.trim()} className="anime-button mt-7 w-full">
            Set sail!
          </button>
        </form>

        {notice && (
          <p
            className={`mt-4 rounded-full border-2 border-ink px-4 py-1 text-sm font-semibold ${
              notice.isError ? "bg-luffy text-cream" : "bg-cream text-ink"
            }`}
          >
            {notice.text}
          </p>
        )}

        <p className="mt-5 rounded-full bg-cream/80 px-4 py-1 text-sm font-semibold text-ink">
          Your progress stays saved in this browser.
        </p>
        <button
          type="button"
          onClick={() => backupInput.current?.click()}
          className="mt-2 rounded-full px-3 py-1 text-sm font-bold text-ink underline decoration-2 underline-offset-4 transition-colors hover:bg-cream/60"
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
    </SeaScene>
  );
}
