import { hakiBurst } from "./haki";
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

// The page jolts like the panel after a big hit.
function shake() {
  document.getElementById("root")?.animate(
    [
      { transform: "translate(0, 0)" },
      { transform: "translate(-7px, 3px)" },
      { transform: "translate(6px, -4px)" },
      { transform: "translate(-4px, -2px)" },
      { transform: "translate(3px, 3px)" },
      { transform: "translate(0, 0)" },
    ],
    { duration: 400, delay: 120, easing: "ease-out" }
  );
}

// The "ドン!!" impact frame: one soft flash, manga focus lines slamming in,
// Conqueror's Haki tearing across the screen, and the page shaking. Shown
// when an arc is cleared or the whole collection is finished.
export function celebrate({ subtitle = "" }) {
  if (typeof document === "undefined" || !canAnimate(document.body)) return;

  const layer = document.createElement("div");
  layer.className = "celebration";
  layer.setAttribute("aria-hidden", "true");

  const flash = document.createElement("div");
  flash.className = "celebration-flash";
  const lines = document.createElement("div");
  lines.className = "celebration-lines";
  layer.append(flash, lines);
  document.body.appendChild(layer);

  hakiBurst(layer);

  const heading = document.createElement("div");
  heading.className = "celebration-title";
  heading.textContent = "ドン!!";
  layer.appendChild(heading);

  let caption = null;
  if (subtitle) {
    caption = document.createElement("div");
    caption.className = "celebration-subtitle";
    caption.textContent = subtitle;
    layer.appendChild(caption);
  }

  flash.animate([{ opacity: 0 }, { opacity: 0.85, offset: 0.12 }, { opacity: 0 }], {
    duration: 520,
    easing: "ease-out",
    fill: "forwards",
  });

  lines.animate(
    [
      { transform: "scale(1.35)", opacity: 0 },
      { transform: "scale(1)", opacity: 1, offset: 0.12 },
      { transform: "scale(1.04)", opacity: 1, offset: 0.75 },
      { transform: "scale(1.1)", opacity: 0 },
    ],
    { duration: 1900, easing: "ease-out", fill: "forwards" }
  );

  heading.animate(
    [
      { transform: "scale(2.8) rotate(-12deg)", opacity: 0 },
      { transform: "scale(.92) rotate(-7deg)", opacity: 1, offset: 0.1 },
      { transform: "scale(1.03) rotate(-8deg)", offset: 0.16 },
      { transform: "scale(1) rotate(-8deg)", opacity: 1, offset: 0.8 },
      { transform: "scale(1.06) rotate(-8deg)", opacity: 0 },
    ],
    { duration: 1900, easing: "cubic-bezier(.2, .9, .3, 1)", fill: "forwards" }
  );

  caption?.animate(
    [
      { transform: "translateY(20px)", opacity: 0 },
      { transform: "translateY(20px)", opacity: 0, offset: 0.14 },
      { transform: "translateY(0)", opacity: 1, offset: 0.28 },
      { transform: "translateY(0)", opacity: 1, offset: 0.8 },
      { transform: "translateY(-8px)", opacity: 0 },
    ],
    { duration: 1900, easing: "ease-out", fill: "forwards" }
  );

  shake();
  setTimeout(() => layer.remove(), 2100);
}
