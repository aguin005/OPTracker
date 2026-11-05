import { prefersReducedMotion } from "./hooks";

// One-shot flourishes that run outside React. They draw straight into the
// page with the Web Animations API and clean up after themselves, and they
// do nothing at all when the device asks for reduced motion.

function canAnimate(element) {
  return Boolean(element?.animate) && !prefersReducedMotion();
}

// A quick springy bounce, used when you tap an episode or a manga volume.
export function pop(element, scale = 1.3) {
  if (!canAnimate(element)) return;
  element.animate(
    [{ transform: "scale(1)" }, { transform: `scale(${scale})` }, { transform: "scale(1)" }],
    { duration: 340, easing: "cubic-bezier(.34, 1.56, .64, 1)" }
  );
}

const CONFETTI_COLORS = ["#F4C430", "#E63946", "#FFF6DF", "#3BA7E8", "#8FBF5C"];

// The big manga-style "DON!!" moment with speed lines and confetti, shown when
// an arc is cleared or the whole collection is finished.
export function celebrate({ title = "DON!!", subtitle = "", colors = [] }) {
  if (typeof document === "undefined" || !canAnimate(document.body)) return;

  const layer = document.createElement("div");
  layer.className = "celebration";
  layer.setAttribute("aria-hidden", "true");

  const burst = document.createElement("div");
  burst.className = "celebration-burst";
  layer.appendChild(burst);

  const heading = document.createElement("div");
  heading.className = "celebration-title";
  heading.textContent = title;
  layer.appendChild(heading);

  let caption = null;
  if (subtitle) {
    caption = document.createElement("div");
    caption.className = "celebration-subtitle";
    caption.textContent = subtitle;
    layer.appendChild(caption);
  }

  const palette = [...colors, ...CONFETTI_COLORS];
  const pieces = Array.from({ length: 72 }, (_, i) => {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.background = palette[i % palette.length];
    if (i % 3 === 0) piece.style.borderRadius = "50%";
    layer.appendChild(piece);
    return piece;
  });

  document.body.appendChild(layer);

  burst.animate(
    [
      { transform: "translate(-50%, -50%) scale(.2) rotate(0deg)", opacity: 0 },
      { transform: "translate(-50%, -50%) scale(1) rotate(8deg)", opacity: 1, offset: 0.2 },
      { transform: "translate(-50%, -50%) scale(1.1) rotate(20deg)", opacity: 0 },
    ],
    { duration: 1900, easing: "ease-out", fill: "forwards" }
  );

  heading.animate(
    [
      { transform: "scale(3.2) rotate(-14deg)", opacity: 0 },
      { transform: "scale(.9) rotate(-6deg)", opacity: 1, offset: 0.14 },
      { transform: "scale(1.04) rotate(-7deg) translateX(-4px)", offset: 0.2 },
      { transform: "scale(1) rotate(-6deg) translateX(4px)", offset: 0.26 },
      { transform: "scale(1) rotate(-6deg)", opacity: 1, offset: 0.8 },
      { transform: "scale(1.08) rotate(-6deg)", opacity: 0 },
    ],
    { duration: 1900, easing: "cubic-bezier(.2, .9, .3, 1)", fill: "forwards" }
  );

  caption?.animate(
    [
      { transform: "translateY(24px)", opacity: 0 },
      { transform: "translateY(24px)", opacity: 0, offset: 0.15 },
      { transform: "translateY(0)", opacity: 1, offset: 0.3 },
      { transform: "translateY(0)", opacity: 1, offset: 0.8 },
      { transform: "translateY(-8px)", opacity: 0 },
    ],
    { duration: 1900, easing: "ease-out", fill: "forwards" }
  );

  for (const piece of pieces) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 140 + Math.random() * 320;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance * 0.75 - 90;
    const spin = (Math.random() * 2 - 1) * 900;
    piece.animate(
      [
        { transform: "translate(0, 0) rotate(0deg) scale(.6)", opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) rotate(${spin / 2}deg) scale(1)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${dx * 1.2}px, ${dy + 320}px) rotate(${spin}deg) scale(1)`, opacity: 0 },
      ],
      { duration: 1500 + Math.random() * 700, easing: "cubic-bezier(.12, .75, .3, 1)", fill: "forwards" }
    );
  }

  setTimeout(() => layer.remove(), 2400);
}
