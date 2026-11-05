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

// Big outlined anime-style heading with a tilted icon badge beside it.
export function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <Reveal className="mb-6">
      <div className="flex items-center gap-3 sm:gap-4">
        <span className="title-badge grid h-12 w-12 shrink-0 place-items-center rounded-xl sm:h-14 sm:w-14">
          <Icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.5} />
        </span>
        <h2 className="anime-heading font-title uppercase leading-none" style={{ fontSize: "clamp(2.1rem, 6vw, 3.6rem)" }}>
          {title}
        </h2>
      </div>
      {subtitle && <p className="mt-3 max-w-2xl text-sm text-cream/70">{subtitle}</p>}
    </Reveal>
  );
}

// Built from spans so it can sit inside a button.
export function ProgressBar({ value, color = "#F4C430", label, className = "" }) {
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
      <span className="progress-fill motion-loop block" style={{ width: `${percent}%`, "--fill": color }} />
    </span>
  );
}

// Parchment pop-up. Clicking the backdrop, the X, or pressing Escape closes it.
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
      <div className="absolute inset-0 bg-sea-950/70 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="modal-card motion-once relative w-full max-w-sm p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-title text-2xl uppercase text-ink">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-ink text-ink transition-colors hover:bg-ink hover:text-parchment"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
