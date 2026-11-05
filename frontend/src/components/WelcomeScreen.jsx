import { useRef, useState } from "react";
import { MAX_NAME_LENGTH, readBackupFile } from "../storage";

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
    <div className="min-h-screen bg-[#0F3652] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm bg-[#EFE1BA] text-[#241C10] rounded-lg p-8 text-center relative">
        <div className="absolute inset-2 border border-[#241C10]/15 rounded pointer-events-none" />

        <p className="text-xs uppercase tracking-[0.3em] text-[#241C10]/50 mb-2">Marine records office</p>
        <h1 className="font-serif text-2xl font-bold mb-1">Wanted</h1>
        <p className="text-sm text-[#241C10]/60 mb-6">for tracking down every episode and omnibus.</p>

        <div className="w-24 h-24 mx-auto rounded-full border-2 border-[#241C10]/30 border-dashed mb-6 flex items-center justify-center text-[#241C10]/30 text-xs">
          your face here
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
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
            className="w-full bg-white text-[#241C10] text-center text-sm px-4 py-2.5 rounded-md border border-[#241C10]/15 placeholder:text-[#241C10]/40 focus:outline-none focus:border-[#241C10]/40"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-[#241C10] text-[#EFE1BA] px-5 py-2.5 rounded-md font-medium text-sm transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Set sail
          </button>
        </form>

        {notice && (
          <p className={`text-xs mt-3 ${notice.isError ? "text-[#A32D2D]" : "text-[#241C10]/70"}`}>{notice.text}</p>
        )}

        <p className="text-[11px] text-[#241C10]/40 mt-6">
          Dead or alive, your progress stays saved in this browser.
        </p>
        <button
          type="button"
          onClick={() => backupInput.current?.click()}
          className="text-[11px] text-[#241C10]/60 underline underline-offset-2 hover:text-[#241C10] transition-colors mt-1"
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
      </div>
    </div>
  );
}
