import { useEffect } from "react";
import { X } from "lucide-react";
import { useInView } from "../hooks";

// Slides its content up into place the first time it scrolls into view.
export function Reveal({ as: Tag = "div", delay = 0, className = "", style, children, ...rest }) {
  const [ref, shown] = useInView();
  return (
    <Tag
      ref={ref}
      data-shown={shown ? "true" : "false"}
      className={`reveal ${className}`}
      style={{ ...style, transitionDelay: shown && delay ? `${delay}ms` : undefined }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// A chapter-title banner: paper lettering on a slanted ink block, a vertical
// brush-written Japanese tag beside it, and the subtitle in a narration box.
export function SectionTitle({ title, kanji, subtitle }) {
  return (
    <Reveal className="mb-6">
      <div className="flex items-start gap-3">
        <h2 className="section-banner font-display uppercase leading-none" style={{ fontSize: "clamp(1.9rem, 5.5vw, 3.2rem)" }}>
          {title}
        </h2>
        {kanji && (
          <span aria-hidden="true" className="kanji-tag font-brush">
            {kanji}
          </span>
        )}
      </div>
      {subtitle && <p className="narration mt-3 max-w-2xl">{subtitle}</p>}
    </Reveal>
  );
}

// Built from spans so it can sit inside a button.
export function ProgressBar({ value, label, className = "" }) {
  const percent = Math.max(0, Math.min(100, value * 100));
  return (
    <span
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
      className={`progress-track block ${className}`}
    >
      <span className="progress-fill motion-loop block" style={{ width: `${percent}%` }} />
    </span>
  );
}

// A manga panel pop-up. Clicking the backdrop, the X, or pressing Escape closes it.
export function Modal({ title, onClose, children }) {
  useEffect(() => {
    function handleKey(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div className="modal-backdrop absolute inset-0" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="modal-card motion-once relative w-full max-w-sm p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h3 className="font-display text-xl uppercase text-ink">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 shrink-0 place-items-center border-2 border-ink text-ink transition-colors hover:bg-ink hover:text-sheet"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
