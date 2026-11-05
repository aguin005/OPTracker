import { useId } from "react";

// Original artwork for the sea scenes, drawn in the spirit of the anime
// without copying any of its characters, ships, or logos. All of it is
// decorative, so it's hidden from screen readers. Looping animations use the
// `motion-loop` class, which pauses them when reduced motion is requested.

const INK = "#2B1D0E";

// A classic skull and crossbones. `crowned` is the reward for 100% progress.
export function JollyRoger({ size = 64, ink = INK, paper = "#F3E3B5", crowned = false, className = "" }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden="true">
      <g fill={ink}>
        {[34, -34].map((deg) => (
          <g key={deg} transform={`rotate(${deg} 50 62)`}>
            <rect x="12" y="58" width="76" height="9" rx="4.5" />
            <circle cx="13" cy="57" r="5.5" />
            <circle cx="13" cy="68" r="5.5" />
            <circle cx="87" cy="57" r="5.5" />
            <circle cx="87" cy="68" r="5.5" />
          </g>
        ))}
        <circle cx="50" cy="44" r="23" />
        <rect x="37" y="54" width="26" height="18" rx="6" />
      </g>
      <g fill={paper}>
        <ellipse cx="41" cy="45" rx="6.5" ry="7.5" />
        <ellipse cx="59" cy="45" rx="6.5" ry="7.5" />
        <path d="M50 53 L46.5 59 H53.5 Z" />
        <rect x="43" y="64" width="2.2" height="8" rx="1" />
        <rect x="48.9" y="64" width="2.2" height="8" rx="1" />
        <rect x="54.8" y="64" width="2.2" height="8" rx="1" />
      </g>
      {crowned && (
        <path
          d="M31 24 L35 7 L43 17 L50 3 L57 17 L65 7 L69 24 Z"
          fill="#F4C430"
          stroke={ink}
          strokeWidth="3"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

// Manga focus lines radiating from the center, worked out once up front.
const SPEED_LINES = (() => {
  const count = 54;
  const point = (r, a) => `${(50 + Math.cos(a) * r).toFixed(2)} ${(50 + Math.sin(a) * r).toFixed(2)}`;
  const paths = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (i % 4) * 0.015;
    const spread = 0.012 + (i % 5) * 0.005;
    const inner = 30 + ((i * 7) % 9) * 2;
    paths.push(`M${point(inner, angle)} L${point(80, angle - spread)} L${point(80, angle + spread)} Z`);
  }
  return paths.join(" ");
})();

export function SpeedLines({ color = INK, className = "" }) {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <path d={SPEED_LINES} fill={color} />
    </svg>
  );
}

// A small caravel with its bow to the right, flying a skull and crossbones.
export function Ship({ className = "", style }) {
  const hull = useId();
  return (
    <svg viewBox="0 0 240 190" className={className} style={style} aria-hidden="true">
      <defs>
        <linearGradient id={hull} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#C47D40" />
          <stop offset="1" stopColor="#7A4520" />
        </linearGradient>
      </defs>

      <g stroke={INK} strokeWidth="1.4" opacity="0.55">
        <path d="M121 10 L30 118" />
        <path d="M121 10 L210 116" />
      </g>

      <path d="M214 114 L238 96" stroke="#6B3E1E" strokeWidth="5" strokeLinecap="round" />
      <path
        d="M126 18 Q172 64 234 98 L176 116 Q160 70 126 18 Z"
        fill="#FFF6DF"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />

      <rect x="118" y="6" width="6" height="117" rx="2" fill="#6B3E1E" stroke={INK} strokeWidth="1.5" />

      <g className="ship-flag motion-loop">
        <path
          d="M124 4 Q138 0 152 6 Q162 10 168 8 L168 28 Q158 30 150 26 Q138 22 124 26 Z"
          fill="#1A1A1A"
          stroke={INK}
          strokeWidth="1.5"
        />
        <svg x="137" y="6" width="18" height="18" viewBox="0 0 100 100">
          <JollyRoger size={100} ink="#FFF6DF" paper="#1A1A1A" />
        </svg>
      </g>

      <path
        d="M144 22 Q121 16 98 22 Q94 34 98 46 Q121 41 144 46 Q148 34 144 22 Z"
        fill="#FFF6DF"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M160 52 Q121 44 82 52 Q74 78 82 104 Q121 96 160 104 Q168 78 160 52 Z"
        fill="#FFF6DF"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <svg x="100" y="55" width="42" height="42" viewBox="0 0 100 100">
        <JollyRoger size={100} ink={INK} paper="#FFF6DF" />
      </svg>
      <rect x="94" y="18" width="54" height="5" rx="2.5" fill="#6B3E1E" stroke={INK} strokeWidth="1.5" />
      <rect x="78" y="48" width="86" height="6" rx="3" fill="#6B3E1E" stroke={INK} strokeWidth="1.5" />

      <path
        d="M226 108 Q204 122 180 122 H46 L14 104 Q18 152 44 170 H170 Q210 162 226 108 Z"
        fill={`url(#${hull})`}
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M218 132 Q200 140 178 140 H42 Q26 132 18 124" fill="none" stroke="#6B3E1E" strokeWidth="6" />
      <path d="M46 122 V113 H184 V122" fill="none" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      {[60, 74, 88, 102, 116, 130, 144, 158, 172].map((x) => (
        <path key={x} d={`M${x} 113 V122`} stroke={INK} strokeWidth="2" />
      ))}
      <rect x="24" y="94" width="38" height="28" rx="3" fill="#B5743A" stroke={INK} strokeWidth="3" />
      <rect x="32" y="100" width="8" height="8" rx="1.5" fill="#FFE45C" stroke={INK} strokeWidth="1.5" />
      <rect x="46" y="100" width="8" height="8" rx="1.5" fill="#FFE45C" stroke={INK} strokeWidth="1.5" />
      {[78, 106, 134, 162].map((x) => (
        <circle key={x} cx={x} cy="152" r="5" fill={INK} stroke="#F4C430" strokeWidth="2" />
      ))}
    </svg>
  );
}

const CLOUD_SHAPES = (
  <>
    <circle cx="42" cy="44" r="18" />
    <circle cx="72" cy="32" r="26" />
    <circle cx="106" cy="36" r="22" />
    <circle cx="132" cy="48" r="14" />
    <rect x="24" y="44" width="122" height="20" rx="10" />
  </>
);

const CLOUDS = [
  { top: "7%", width: 190, duration: 85, delay: -12 },
  { top: "24%", width: 120, duration: 60, delay: -40 },
  { top: "3%", width: 250, duration: 110, delay: -75 },
  { top: "36%", width: 150, duration: 75, delay: -22 },
  { top: "15%", width: 100, duration: 50, delay: -5 },
];

export function Clouds() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {CLOUDS.map((cloud, i) => (
        <svg
          key={i}
          viewBox="0 0 160 72"
          className="cloud motion-loop absolute left-0"
          style={{
            top: cloud.top,
            width: cloud.width,
            animationDuration: `${cloud.duration}s`,
            animationDelay: `${cloud.delay}s`,
          }}
        >
          <g fill="#BFE6FB" transform="translate(0 6)">{CLOUD_SHAPES}</g>
          <g fill="#FFFFFF">{CLOUD_SHAPES}</g>
        </svg>
      ))}
    </div>
  );
}

const GULLS = [
  { top: "18%", size: 34, duration: 26, delay: -6 },
  { top: "28%", size: 24, duration: 34, delay: -20 },
  { top: "11%", size: 20, duration: 40, delay: -31 },
];

export function Gulls() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {GULLS.map((gull, i) => (
        <div
          key={i}
          className="gull motion-loop absolute left-0"
          style={{ top: gull.top, animationDuration: `${gull.duration}s`, animationDelay: `${gull.delay}s` }}
        >
          <svg viewBox="0 0 40 16" width={gull.size} className="overflow-visible">
            <path
              className="gull-wings motion-loop"
              d="M2 9 Q10 0 20 9 Q30 0 38 9"
              fill="none"
              stroke={INK}
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}

// One wave tile. Its start and end match in height and slope, so two copies
// side by side scroll forever without a visible seam.
const WAVE_FILL = "M0 40 C120 10 240 10 360 40 S600 70 720 40 S960 10 1080 40 S1320 70 1440 40 V120 H0 Z";
const WAVE_CREST = "M0 40 C120 10 240 10 360 40 S600 70 720 40 S960 10 1080 40 S1320 70 1440 40";

export function Waves({ layers, className = "" }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-x-0 bottom-0 ${className}`}>
      {layers.map((layer, i) => (
        <div key={i} className="absolute inset-x-0 bottom-0 overflow-hidden" style={{ height: layer.height }}>
          <div
            className="wave-track motion-loop flex h-full w-[200%]"
            style={{
              animationDuration: `${layer.speed}s`,
              animationDelay: `${layer.delay ?? 0}s`,
              animationDirection: layer.reverse ? "reverse" : "normal",
            }}
          >
            {[0, 1].map((copy) => (
              <svg key={copy} viewBox="0 0 1440 120" preserveAspectRatio="none" className="h-full w-1/2">
                <path d={WAVE_FILL} fill={layer.color} />
                <path
                  d={WAVE_CREST}
                  fill="none"
                  stroke="#FFFFFF"
                  strokeOpacity={layer.foam ?? 0.35}
                  strokeWidth="4"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const BACK_WAVES = [
  { color: "#86D3F4", height: 128, speed: 26, delay: -4, foam: 0.5 },
  { color: "#3FA2DD", height: 104, speed: 19, delay: -11, reverse: true },
];
// The last layer matches the top of the page background so the scene
// flows straight into the sea below it.
const FRONT_WAVES = [
  { color: "#1A6FAE", height: 72, speed: 14, delay: -3 },
  { color: "#0B3A5E", height: 46, speed: 10, delay: -7, reverse: true, foam: 0.2 },
];

// Bright anime sky over open water: sun rays, drifting clouds, gulls, and a
// ship riding the waves. Whatever's passed as children sits in the sky.
export function SeaScene({ className = "", shipClassName = "", children }) {
  return (
    <div className={`sea-sky relative overflow-hidden ${className}`}>
      <div aria-hidden="true" className="absolute left-1/2 top-[-35%] aspect-square w-[160%] -translate-x-1/2 sm:w-[120%]">
        <div className="sunburst motion-loop h-full w-full rounded-full" />
      </div>
      <div aria-hidden="true" className="sun absolute right-[7%] top-[9%] h-20 w-20 rounded-full sm:h-28 sm:w-28" />
      <Clouds />
      <Gulls />
      {children}
      <Waves layers={BACK_WAVES} />
      <div aria-hidden="true" className={`ship-drift motion-loop pointer-events-none absolute ${shipClassName}`}>
        <div className="ship-bob motion-loop">
          <Ship className="h-auto w-full" />
        </div>
      </div>
      <Waves layers={FRONT_WAVES} />
    </div>
  );
}

const BUBBLES = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 37 + 11) % 100}%`,
  top: `${(i * 53 + 7) % 100}%`,
  size: 6 + ((i * 11) % 5) * 4,
  duration: 7 + ((i * 7) % 6),
  delay: -((i * 5) % 11),
}));

// Deep water behind the content: sunlight shafts near the surface and
// bubbles drifting up all the way down.
export function Underwater() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="light-rays motion-loop absolute inset-x-0 top-0 h-[42rem]" />
      {BUBBLES.map((bubble, i) => (
        <span
          key={i}
          className="bubble motion-loop"
          style={{
            left: bubble.left,
            top: bubble.top,
            width: bubble.size,
            height: bubble.size,
            animationDuration: `${bubble.duration}s`,
            animationDelay: `${bubble.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
