// Helpers shared by the wanted posters on the welcome screen and the tracker.

// Ragged paper edges as a clip-path, worked out once with a fixed
// pseudo-random sequence so the poster looks the same on every visit.
export const TORN_EDGE = (() => {
  const steps = 22;
  const jag = (i) => (Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1) * 1.8;
  const pct = (n) => `${n.toFixed(2)}%`;
  const points = [];
  for (let i = 0; i <= steps; i++) points.push(`${pct((i / steps) * 100)} ${pct(jag(i))}`);
  for (let i = 1; i <= steps; i++) points.push(`${pct(100 - jag(i + 40))} ${pct((i / steps) * 100)}`);
  for (let i = 1; i <= steps; i++) points.push(`${pct(100 - (i / steps) * 100)} ${pct(100 - jag(i + 80))}`);
  for (let i = 1; i < steps; i++) points.push(`${pct(jag(i + 120))} ${pct(100 - (i / steps) * 100)}`);
  return `polygon(${points.join(", ")})`;
})();

// Every wanted poster gets "D" as the middle name, first and last name come
// from the name you entered, whatever's in between gets dropped.
export function posterName(name) {
  const parts = name.toUpperCase().split(" ").filter(Boolean);
  if (parts.length <= 1) return [parts[0] || "UNKNOWN", "D"].join(" · ");
  return [parts[0], "D", parts[parts.length - 1]].join(" · ");
}
