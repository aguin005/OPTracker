// Original artwork for the sea scenes, drawn like a black-and-white manga
// page (ink lines, screentone, focus lines, sound effects) without copying
// any of the series' characters, ships, or logos. All of it is decorative, so
// it's hidden from screen readers. Looping animations use the `motion-loop`
// class, which pauses them when reduced motion is requested.

const INK = "#121212";
const PAPER = "#FBF8F2";

// A classic skull and crossbones. `crowned` is the reward for 100% progress.
export function JollyRoger({ size = 64, ink = INK, paper = PAPER, crowned = false, className = "" }) {
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
          fill={paper}
          stroke={ink}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

// Manga speed lines radiating from the center of a square, worked out once.
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

// Focus lines (集中線) for a wide panel: thin ink wedges closing in on an
// oval of clear paper in the middle, where the title sits.
const FOCUS_LINES = (() => {
  const count = 150;
  const point = (r, a) => `${(100 + Math.cos(a) * 100 * r).toFixed(2)} ${(50 + Math.sin(a) * 50 * r).toFixed(2)}`;
  const paths = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + ((i * 7) % 5) * 0.004;
    const spread = 0.0035 + ((i * 13) % 7) * 0.0015;
    const inner = 0.6 + ((i * 17) % 11) * 0.032;
    paths.push(`M${point(inner, angle)} L${point(1.6, angle - spread)} L${point(1.6, angle + spread)} Z`);
  }
  return paths.join(" ");
})();

export function FocusLines({ className = "" }) {
  return (
    <svg viewBox="0 0 200 100" preserveAspectRatio="none" className={className} aria-hidden="true">
      <path d={FOCUS_LINES} fill={INK} />
    </svg>
  );
}

// A small caravel in ink with its bow to the right: black hull with paper
// plank lines, paper sails with fold lines, and a skull and crossbones flag.
export function Ship({ className = "", style }) {
  return (
    <svg viewBox="0 0 240 190" className={className} style={style} aria-hidden="true">
      <g stroke={INK} strokeWidth="1.4">
        <path d="M121 10 L30 118" />
        <path d="M121 10 L210 116" />
      </g>

      <path d="M214 114 L238 96" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <path
        d="M126 18 Q172 64 234 98 L176 116 Q160 70 126 18 Z"
        fill={PAPER}
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M140 46 Q170 80 206 100" fill="none" stroke={INK} strokeWidth="1.5" />

      <rect x="118" y="6" width="6" height="117" rx="2" fill={INK} />

      <g className="ship-flag motion-loop">
        <path d="M124 4 Q138 0 152 6 Q162 10 168 8 L168 28 Q158 30 150 26 Q138 22 124 26 Z" fill={INK} />
        <svg x="137" y="6" width="18" height="18" viewBox="0 0 100 100">
          <JollyRoger size={100} ink={PAPER} paper={INK} />
        </svg>
      </g>

      <path
        d="M144 22 Q121 16 98 22 Q94 34 98 46 Q121 41 144 46 Q148 34 144 22 Z"
        fill={PAPER}
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M106 30 Q121 27 136 30" fill="none" stroke={INK} strokeWidth="1.4" />
      <path
        d="M160 52 Q121 44 82 52 Q74 78 82 104 Q121 96 160 104 Q168 78 160 52 Z"
        fill={PAPER}
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M90 60 Q86 78 90 96 M152 60 Q156 78 152 96" fill="none" stroke={INK} strokeWidth="1.4" />
      <svg x="100" y="55" width="42" height="42" viewBox="0 0 100 100">
        <JollyRoger size={100} />
      </svg>
      <rect x="94" y="18" width="54" height="5" rx="2.5" fill={INK} />
      <rect x="78" y="48" width="86" height="6" rx="3" fill={INK} />

      <path
        d="M226 108 Q204 122 180 122 H46 L14 104 Q18 152 44 170 H170 Q210 162 226 108 Z"
        fill={INK}
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M22 128 Q30 134 46 134 H184 Q206 132 220 120 M30 146 Q40 152 56 152 H174 Q196 150 210 138"
        fill="none"
        stroke={PAPER}
        strokeWidth="1.6"
      />
      <path d="M46 122 V113 H184 V122" fill="none" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      {[60, 74, 88, 102, 116, 130, 144, 158, 172].map((x) => (
        <path key={x} d={`M${x} 113 V122`} stroke={INK} strokeWidth="2" />
      ))}
      <rect x="24" y="94" width="38" height="28" rx="3" fill={PAPER} stroke={INK} strokeWidth="3" />
      <rect x="32" y="100" width="8" height="8" rx="1.5" fill={INK} />
      <rect x="46" y="100" width="8" height="8" rx="1.5" fill={INK} />
      {[78, 106, 134, 162].map((x) => (
        <circle key={x} cx={x} cy="141" r="4.5" fill={PAPER} stroke={INK} strokeWidth="2" />
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
];

// Paper-white clouds with an ink outline: the shapes are drawn once fat in
// ink, then again in paper on top, which leaves only the outer edge inked.
export function Clouds() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {CLOUDS.map((cloud, i) => (
        <svg
          key={i}
          viewBox="-4 -4 168 80"
          className="cloud motion-loop absolute left-0"
          style={{
            top: cloud.top,
            width: cloud.width,
            animationDuration: `${cloud.duration}s`,
            animationDelay: `${cloud.delay}s`,
          }}
        >
          <g fill={INK} stroke={INK} strokeWidth="6">
            {CLOUD_SHAPES}
          </g>
          <g fill={PAPER}>{CLOUD_SHAPES}</g>
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
// side by side scroll forever without a visible seam. The shape is used as a
// mask over a screentone, so the dots and lines stay crisp at any width.
const WAVE_FILL = "M0 40 C120 10 240 10 360 40 S600 70 720 40 S960 10 1080 40 S1320 70 1440 40 V120 H0 Z";
const WAVE_CREST = "M0 40 C120 10 240 10 360 40 S600 70 720 40 S960 10 1080 40 S1320 70 1440 40";
const WAVE_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 120' preserveAspectRatio='none'><path d='${WAVE_FILL}'/></svg>`
)}")`;
const WAVE_MASK_STYLE = {
  maskImage: WAVE_MASK,
  WebkitMaskImage: WAVE_MASK,
  maskSize: "100% 100%",
  WebkitMaskSize: "100% 100%",
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
};

export function Waves({ layers }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0">
      {layers.map((layer, i) => (
        <div key={i} className="absolute inset-x-0 bottom-0 overflow-hidden" style={{ height: layer.height }}>
          {/* Each of the two tiles is at least 720px wide so the waves stay
              gentle on phones. The track slides by exactly one tile (-50%). */}
          <div
            className="wave-track motion-loop flex h-full w-[200%] min-w-[1440px]"
            style={{
              animationDuration: `${layer.speed}s`,
              animationDelay: `${layer.delay ?? 0}s`,
              animationDirection: layer.reverse ? "reverse" : "normal",
            }}
          >
            {[0, 1].map((copy) => (
              <div key={copy} className="relative h-full w-1/2">
                <div className={`absolute inset-0 ${layer.tone}`} style={WAVE_MASK_STYLE} />
                <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                  <path d={WAVE_CREST} fill="none" stroke={layer.crest} strokeWidth="3" vectorEffect="non-scaling-stroke" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Hand-lettered sound effects in katakana, black with a paper outline.
export function Sfx({ children, vertical = false, className = "", style }) {
  return (
    <span aria-hidden="true" className={`sfx ${vertical ? "sfx-vertical" : ""} ${className}`} style={style}>
      {children}
    </span>
  );
}

const BACK_WAVES = [
  { tone: "tone-dots", crest: INK, height: 132, speed: 28, delay: -4 },
  { tone: "tone-lines", crest: INK, height: 100, speed: 20, delay: -11, reverse: true },
];
const FRONT_WAVES = [{ tone: "tone-ink", crest: PAPER, height: 60, speed: 13, delay: -6 }];

// A splash page: focus lines closing in on whatever's passed as children,
// screentone sky, ink clouds and gulls, a rumbling ゴゴゴ, and a ship riding
// screentone waves.
export function MangaScene({ className = "", shipClassName = "", children }) {
  return (
    <div className={`manga-scene relative overflow-hidden ${className}`}>
      <div aria-hidden="true" className="sky-tone absolute inset-0" />
      <FocusLines className="focus-lines motion-loop absolute inset-0 h-full w-full" />
      <Clouds />
      <Gulls />
      <Sfx vertical className="sfx-rumble motion-loop absolute left-[3%] top-[14%] text-3xl sm:text-5xl">
        ゴゴゴゴ
      </Sfx>
      <Sfx
        vertical
        className="sfx-rumble motion-loop absolute right-[4%] top-[36%] text-2xl sm:text-4xl"
        style={{ animationDelay: "-0.5s" }}
      >
        ゴゴゴ
      </Sfx>
      {children}
      <Waves layers={BACK_WAVES} />
      <div aria-hidden="true" className={`ship-drift motion-loop pointer-events-none absolute ${shipClassName}`}>
        <div className="ship-bob motion-loop">
          <Ship className="h-auto w-full" />
        </div>
      </div>
      <Waves layers={FRONT_WAVES} />
      <Sfx className="absolute bottom-2 left-[44%] -rotate-6 text-lg sm:text-2xl">ザザーン</Sfx>
    </div>
  );
}
