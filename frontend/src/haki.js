import { prefersReducedMotion } from "./hooks";

// Conqueror's Haki as red-and-black lightning, drawn on the fly as SVG. Every
// strike is short-lived and removes itself. Nothing runs when the device asks
// for reduced motion, and a bolt flickers at most twice, so nothing strobes.

const SVG_NS = "http://www.w3.org/2000/svg";

// The points of one jagged bolt from (x1, y1) to (x2, y2). The straight line is
// cut into short steps and each step is pushed sideways at random, most in the
// middle of the bolt and least at its ends.
function jaggedLine(x1, y1, x2, y2, jag) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy) || 1;
  const nx = -dy / length;
  const ny = dx / length;
  const steps = Math.max(4, Math.round(length / 18));
  const points = [[x1, y1]];
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const push = (Math.random() * 2 - 1) * jag * Math.sin(Math.PI * t);
    points.push([x1 + dx * t + nx * push, y1 + dy * t + ny * push]);
  }
  points.push([x2, y2]);
  return points;
}

function toPath(points) {
  return points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
}

// A bolt with one or two smaller forks splitting off it.
function boltPath(x1, y1, x2, y2, jag) {
  const main = jaggedLine(x1, y1, x2, y2, jag);
  const parts = [toPath(main)];
  const heading = Math.atan2(y2 - y1, x2 - x1);
  const length = Math.hypot(x2 - x1, y2 - y1);
  const forks = 1 + Math.floor(Math.random() * 2);
  for (let i = 0; i < forks; i++) {
    const [fx, fy] = main[1 + Math.floor(Math.random() * (main.length - 2))];
    const turn = (Math.random() < 0.5 ? -1 : 1) * (0.45 + Math.random() * 0.6);
    const reach = length * (0.25 + Math.random() * 0.3);
    const end = [fx + Math.cos(heading + turn) * reach, fy + Math.sin(heading + turn) * reach];
    parts.push(toPath(jaggedLine(fx, fy, end[0], end[1], jag * 0.6)));
  }
  return parts.join(" ");
}

function makeLayer(width, height, className) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("class", className);
  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.setAttribute("aria-hidden", "true");
  return svg;
}

// Each bolt is stroked three times: a soft red glow, a red body, and a thin
// black core, the way the anime draws Conqueror's Haki.
function addBolt(svg, d, delay) {
  const group = document.createElementNS(SVG_NS, "g");
  for (const layer of ["haki-glow", "haki-body", "haki-core"]) {
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", d);
    path.setAttribute("class", layer);
    group.appendChild(path);
  }
  group.style.opacity = "0";
  svg.appendChild(group);
  group.animate?.(
    [
      { opacity: 0 },
      { opacity: 1, offset: 0.05 },
      { opacity: 0.3, offset: 0.16 },
      { opacity: 1, offset: 0.24 },
      { opacity: 1, offset: 0.62 },
      { opacity: 0 },
    ],
    { duration: 640 + Math.random() * 240, delay, easing: "ease-out", fill: "forwards" }
  );
}

function blocked() {
  return typeof document === "undefined" || document.hidden || prefersReducedMotion();
}

// Crackles a few bolts outward from the edges of `host`, an absolutely
// positioned layer covering whatever the haki surrounds.
export function strike(host, { bolts = 3, reach = 80 } = {}) {
  if (blocked() || !host?.isConnected) return;
  const { width, height } = host.getBoundingClientRect();
  if (!width || !height) return;

  const svg = makeLayer(width + reach * 2, height + reach * 2, "haki-layer");
  svg.style.left = `${-reach}px`;
  svg.style.top = `${-reach}px`;
  host.appendChild(svg);

  const cx = reach + width / 2;
  const cy = reach + height / 2;
  for (let i = 0; i < bolts; i++) {
    const angle = Math.random() * Math.PI * 2;
    const sx = cx + Math.cos(angle) * (width / 2) * (0.75 + Math.random() * 0.3);
    const sy = cy + Math.sin(angle) * (height / 2) * (0.75 + Math.random() * 0.3);
    const outward = angle + (Math.random() * 2 - 1) * 0.5;
    const length = reach * (0.55 + Math.random() * 0.45);
    const d = boltPath(sx, sy, sx + Math.cos(outward) * length, sy + Math.sin(outward) * length, 12);
    addBolt(svg, d, i * 70);
  }
  setTimeout(() => svg.remove(), 1400);
}

// A burst that tears outward across the whole screen from just above the
// middle, for the big "ドン!!" moments. Drawn into `into`, a fixed overlay.
export function hakiBurst(into, { bolts = 12 } = {}) {
  if (blocked() || !into) return;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const svg = makeLayer(width, height, "haki-layer haki-screen");
  into.appendChild(svg);

  const cx = width / 2;
  const cy = height * 0.46;
  const reach = Math.hypot(width, height) / 2;
  for (let i = 0; i < bolts; i++) {
    const angle = (i / bolts) * Math.PI * 2 + Math.random() * 0.4;
    const start = 80 + Math.random() * 50;
    const length = reach * (0.5 + Math.random() * 0.45);
    const from = [cx + Math.cos(angle) * start, cy + Math.sin(angle) * start];
    const to = [cx + Math.cos(angle) * (start + length), cy + Math.sin(angle) * (start + length)];
    addBolt(svg, boltPath(from[0], from[1], to[0], to[1], 26), 60 + (i % 4) * 90);
  }
}
