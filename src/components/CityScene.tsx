import { type ReactNode, useRef } from "react";
import { useInView } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════════
   CityScene — Animated pixel-art city skyline
   3 scrolling layers (back → mid → front) + ground + sky elements

   All animations are pure CSS (@keyframes + transitions).
   Framer Motion is only used for useInView (lightweight IntersectionObserver).
   Reduced-motion is handled entirely via CSS media query.
   ═══════════════════════════════════════════════════════════════════ */

/* ─── Palette ─── */
const SKY = "#0c1222";
const BACK_CLR = "#1e293b"; // slate-800  — distant back layer (thin spires)
const BACK_WIDE_CLR = "#182032"; // slightly darker — wide low blocks recede further
const MID_CLR = "#283548"; // slate-700  — windowed mid layer (fallback)
const MID_GRADS = ["url(#mid-grad-0)", "url(#mid-grad-1)", "url(#mid-grad-2)"];
const MID_EDGE_CLR = "#4a6280"; // roof-edge highlight
const FRONT_CLR = "#0a1018"; // near-black — closest silhouettes
const CYAN = "#22d3ee"; // cyan-400   — windows, accents
const STAR_CLR = "#e2e8f0"; // slate-200  — stars, moon

/* ─── Dimensions ─── */
const W = 800;
const H = 160;
const GROUND_Y = H - 6;

/* ─── Scroll speeds (seconds per full loop) ─── */
const SPEED_BACK = 300;
const SPEED_MID = 240;
const SPEED_FRONT = 55;

/** Knuth multiplicative hash constants for deterministic pseudo-random */
const HASH_A = 2654435761;
const HASH_B = 2246822519;
const HASH_C = 1597334677;

/* ─── Window grid sizing ─── */
const WIN = {
  mid: { pad: 8, gap: 10, rowGap: 12, w: 5, h: 7 },
  back: { pad: 6, gap: 8, rowGap: 10, w: 3, h: 4 },
  backThin: { rowGap: 10, w: 3, h: 4 },
} as const;

/* ─── Moon position ─── */
const MOON = { cx: 590, cy: 54, r: 7, cutCx: 593.5, cutCy: 52.5, cutR: 6 } as const;

/* ─── Shared types ─── */
interface Bldg {
  x: number;
  w: number;
  h: number;
}

interface MidWin {
  x: number;
  y: number;
  pulse: boolean;
  delay: number;
}

interface BackWin {
  x: number;
  y: number;
}

/* ═══════════════════════════════════════════════════════════════════
   Layer data — ordered back to front
   ═══════════════════════════════════════════════════════════════════ */

/* ─── BACK layer — thin spires + wide low blocks (300s scroll) ─── */
const BACK_BUILDINGS: Bldg[] = [
  { x: 10, w: 12, h: 65 },
  { x: 55, w: 10, h: 52 },
  { x: 90, w: 26, h: 30 },
  { x: 148, w: 10, h: 70 },
  { x: 195, w: 14, h: 50 },
  { x: 240, w: 22, h: 16 },
  { x: 330, w: 11, h: 58 },
  { x: 355, w: 13, h: 38 },
  { x: 400, w: 28, h: 26 },
  { x: 458, w: 13, h: 58 },
  { x: 500, w: 12, h: 62 },
  { x: 545, w: 24, h: 14 },
  { x: 580, w: 11, h: 75 },
  { x: 640, w: 14, h: 55 },
  { x: 685, w: 25, h: 22 },
  { x: 725, w: 12, h: 63 },
  { x: 760, w: 11, h: 60 },
];

/** Wide back buildings (w > 15) get faded cyan windows */
const BACK_WIDE = BACK_BUILDINGS.filter((b) => b.w > 15);

/** Thin back buildings (w ≤ 15) get 1-2 sparse cyan windows */
const BACK_THIN = BACK_BUILDINGS.filter((b) => b.w <= 15);

/* ─── MID layer — main buildings with windows + antennas (240s scroll) ─── */
const MID_BUILDINGS: Bldg[] = [
  { x: 30, w: 40, h: 80 },
  { x: 95, w: 48, h: 100 },
  { x: 168, w: 36, h: 70 },
  { x: 228, w: 44, h: 105 },
  { x: 300, w: 40, h: 82 },
  { x: 370, w: 52, h: 115 },
  { x: 450, w: 42, h: 90 },
  { x: 520, w: 50, h: 108 },
  { x: 600, w: 38, h: 75 },
  { x: 660, w: 48, h: 95 },
  { x: 735, w: 44, h: 68 },
];

/** Indices into MID_BUILDINGS that get rooftop antennas */
const ANTENNA_INDICES = [1, 3, 5, 7, 9];

/* ─── FRONT layer — low silhouettes with varied rooflines (55s scroll) ─── */
const FRONT_PATHS: string[] = [
  "M-5,160 V138 H10 V132 L22,125 L34,132 V138 H48 V160 Z",                                       // h35
  "M80,160 V148 H90 V144 L100,138 L110,144 V148 H120 V152 H125 V146 H130 V152 H140 V160 Z",      // h22
  "M212,160 V141 H222 V136 H226 V141 H232 V138 L247,130 L257,138 V160 Z",                         // h30
  "M293,160 V144 H313 V160 Z M296,144 V136 H310 V144 Z M299,136 V131 H307 V136 Z",                // h29
  "M395,160 V150 H405 V143 H409 V150 H415 V147 L430,140 L445,147 V160 Z",                         // h20
  "M500,160 V144 H510 V138 L516,132 L522,138 V144 H540 V160 Z",                                   // h28
  "M575,160 V136 L595,126 L615,136 V160 Z",                                                        // h34
  "M700,160 V150 H710 V144 H714 V150 H725 V156 H733 V146 H740 V142 H744 V146 H757 V160 Z",       // h18
  "M790,160 V142 H808 V136 H815 V142 H830 V160 Z",                                                // h24
];

/* ─── Stars ─── */
const STARS = [
  { cx: 25, cy: 42, r: 0.7 },
  { cx: 80, cy: 58, r: 0.4 },
  { cx: 130, cy: 35, r: 0.5 },
  { cx: 175, cy: 50, r: 0.9 },
  { cx: 220, cy: 40, r: 0.4 },
  { cx: 270, cy: 55, r: 1.0 },
  { cx: 315, cy: 38, r: 0.6 },
  { cx: 370, cy: 48, r: 1.2 },
  { cx: 420, cy: 36, r: 0.5 },
  { cx: 465, cy: 52, r: 0.8 },
  { cx: 510, cy: 42, r: 0.3 },
  { cx: 555, cy: 60, r: 0.6 },
  { cx: 595, cy: 37, r: 1.1 },
  { cx: 640, cy: 50, r: 0.4 },
  { cx: 680, cy: 44, r: 0.7 },
  { cx: 720, cy: 56, r: 0.5 },
  { cx: 755, cy: 39, r: 0.9 },
  { cx: 50, cy: 62, r: 0.3 },
  { cx: 350, cy: 63, r: 0.3 },
  { cx: 620, cy: 64, r: 0.4 },
  { cx: 160, cy: 72, r: 0.4 },
  { cx: 390, cy: 78, r: 0.3 },
  { cx: 540, cy: 68, r: 0.5 },
  { cx: 700, cy: 75, r: 0.3 },
  { cx: 440, cy: 82, r: 0.4 },
];

/* ═══════════════════════════════════════════════════════════════════
   Pre-computed window data (generated once at module load)
   ═══════════════════════════════════════════════════════════════════ */

/** Fisher-Yates shuffle to randomize building-by-building window reveal order */
function createBuildingDelayMap(): Map<number, number> {
  const indices = MID_BUILDINGS.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const seed = (i * HASH_A) >>> 0;
    const j = seed % (i + 1);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const map = new Map<number, number>();
  indices.forEach((bIdx, order) => map.set(bIdx, order));
  return map;
}

const MID_BLDG_DELAY = createBuildingDelayMap();

/** Generate animated windows for the mid layer buildings */
function generateMidWindows(): MidWin[] {
  const g = WIN.mid;
  const wins: MidWin[] = [];
  MID_BUILDINGS.forEach((b, bIdx) => {
    const cols = Math.floor((b.w - g.pad) / g.gap);
    const rows = Math.floor((b.h - g.pad) / g.rowGap);
    const order = MID_BLDG_DELAY.get(bIdx) ?? bIdx;
    const baseDelay = 1.0 + order * 0.2;
    const startIdx = wins.length;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const seed = (bIdx * 100 + r * 10 + c) * HASH_A;
        const roll = (seed >>> 0) % 100;
        if (roll > 30) continue; // ~30% of slots get a window
        wins.push({
          x: b.x + 6 + c * g.gap,
          y: H - b.h + 8 + r * g.rowGap,
          pulse: roll < 12, // ~12% of slots → ~40% of windows pulse
          delay: baseDelay + r * 0.08,
        });
      }
    }
    // Guarantee at least 2 pulsing windows per building
    const bWins = wins.slice(startIdx);
    const pulseCount = bWins.filter((w) => w.pulse).length;
    for (let p = pulseCount; p < 2 && startIdx + p < wins.length; p++) {
      wins[startIdx + p].pulse = true;
    }
    // Sparse buildings (< 4 windows): add 2 guaranteed windows
    if (bWins.length < 4) {
      wins.push({
        x: b.x + Math.floor(b.w / 2) - 2,
        y: H - b.h + Math.floor(b.h / 3),
        pulse: true,
        delay: baseDelay,
      });
      wins.push({
        x: b.x + Math.floor(b.w / 2) + 3,
        y: H - b.h + Math.floor((b.h * 2) / 3),
        pulse: false,
        delay: baseDelay + 0.1,
      });
    }
  });
  return wins;
}

/** Generate faded windows for the wide back-layer buildings */
function generateBackWideWindows(): BackWin[] {
  const g = WIN.back;
  const wins: BackWin[] = [];
  BACK_WIDE.forEach((b, bIdx) => {
    const cols = Math.floor((b.w - g.pad) / g.gap);
    const rows = Math.floor((b.h - g.pad) / g.rowGap);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const seed = (bIdx * 77 + r * 13 + c) * HASH_B;
        if ((seed >>> 0) % 100 > 28) continue;
        wins.push({
          x: b.x + 4 + c * g.gap,
          y: H - b.h + 6 + r * g.rowGap,
        });
      }
    }
  });
  return wins;
}

/** Generate 1-2 sparse windows for thin back-layer buildings */
function generateBackThinWindows(): BackWin[] {
  const wins: BackWin[] = [];
  BACK_THIN.forEach((b, bIdx) => {
    const rows = Math.floor((b.h - 6) / WIN.backThin.rowGap);
    for (let r = 0; r < rows; r++) {
      const seed = (bIdx * 53 + r * 17) * HASH_C;
      if ((seed >>> 0) % 100 > 25) continue;
      wins.push({
        x: b.x + Math.floor(b.w / 2) - 1,
        y: H - b.h + 5 + r * WIN.backThin.rowGap,
      });
    }
  });
  return wins;
}

const MID_WINDOWS = generateMidWindows();
const BACK_WIDE_WINDOWS = generateBackWideWindows();
const BACK_THIN_WINDOWS = generateBackThinWindows();

/* ═══════════════════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════════════════ */

/** Render mid buildings with per-building gradient fills */
function MidBuildingRects() {
  return (
    <>
      {MID_BUILDINGS.map((b, i) => (
        <rect key={i} x={b.x} y={H - b.h} width={b.w} height={b.h} fill={MID_GRADS[i % 3]} />
      ))}
    </>
  );
}

/** Render a subtle roof-edge highlight on each mid building */
function MidRoofEdges() {
  return (
    <>
      {MID_BUILDINGS.map((b, i) => (
        <rect key={i} x={b.x} y={H - b.h} width={b.w} height={1} fill={MID_EDGE_CLR} opacity={0.6} />
      ))}
    </>
  );
}

/** Render Bldg[] as simple <rect> elements */
function Rects({ items, fill }: { items: Bldg[]; fill: string }) {
  return (
    <>
      {items.map((b, i) => (
        <rect key={i} x={b.x} y={H - b.h} width={b.w} height={b.h} fill={fill} />
      ))}
    </>
  );
}

/** Render SVG path silhouettes */
function Paths({ items, fill }: { items: string[]; fill: string }) {
  return (
    <>
      {items.map((d, i) => (
        <path key={i} d={d} fill={fill} />
      ))}
    </>
  );
}

/** Render BackWin[] as tiny faded rects */
function BackWindows({ items }: { items: BackWin[] }) {
  return (
    <>
      {items.map((win, i) => (
        <rect
          key={i}
          x={win.x}
          y={win.y}
          width={WIN.back.w}
          height={WIN.back.h}
          rx={0.3}
          fill={CYAN}
          opacity={0.15}
        />
      ))}
    </>
  );
}

/**
 * Seamless scroll wrapper — renders children twice (primary + offset duplicate)
 * so the CSS `city-scroll` animation loops seamlessly.
 */
function ScrollLayer({
  speed,
  children,
}: {
  speed: number;
  children: ReactNode;
}) {
  return (
    <g
      className="city-scroll-layer"
      style={{ animation: `city-scroll ${speed}s linear infinite` }}
    >
      {children}
      <g transform={`translate(${W}, 0)`}>{children}</g>
    </g>
  );
}

/** Twinkling star field — CSS animated */
function StarField() {
  return (
    <>
      {STARS.map((s, i) => (
        <circle
          key={i}
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          fill={STAR_CLR}
          className="star-twinkle"
          style={{
            animation: `star-twinkle ${2.5 + (i % 4)}s ease-in-out infinite`,
            animationDelay: `${0.3 + i * 0.12}s`,
          }}
        />
      ))}
    </>
  );
}

/** Crescent moon with double cyan halo — CSS transition fade-in */
function CrescentMoon() {
  return (
    <g className="city-moon">
      <circle cx={MOON.cx} cy={MOON.cy} r={60} fill="url(#moon-outer-halo)" />
      <circle cx={MOON.cx} cy={MOON.cy} r={38} fill="url(#moon-halo)" />
      <circle
        cx={MOON.cx}
        cy={MOON.cy}
        r={MOON.r}
        fill={STAR_CLR}
        opacity={0.85}
        mask="url(#crescent-mask)"
      />
    </g>
  );
}

/** Rooftop antennas for select mid-layer buildings */
function Antennas() {
  return (
    <>
      {ANTENNA_INDICES.map((idx) => {
        const b = MID_BUILDINGS[idx];
        const cx = b.x + b.w / 2;
        const top = H - b.h;
        return (
          <g key={idx}>
            <rect x={cx - 0.8} y={top - 12} width={1.6} height={12} fill={MID_CLR} />
            <circle cx={cx} cy={top - 13} r={1.2} fill={CYAN} opacity={0.6} />
          </g>
        );
      })}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Main component
   ═══════════════════════════════════════════════════════════════════ */

interface CitySceneProps {
  className?: string;
}

export default function CityScene({ className }: CitySceneProps) {
  const ref = useRef<SVGSVGElement>(null);
  const hasFadedIn = useInView(ref, { once: true, margin: "-40px" });

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      className={`city-scene${hasFadedIn ? " faded-in" : ""}${className ? ` ${className}` : ""}`}
      preserveAspectRatio="xMidYMax slice"
      overflow="hidden"
      aria-hidden="true"
    >
      {/* ─── Gradient & mask definitions ─── */}
      <defs>
        <radialGradient id="moon-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={CYAN} stopOpacity="0.12" />
          <stop offset="60%" stopColor={CYAN} stopOpacity="0.04" />
          <stop offset="100%" stopColor={CYAN} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="moon-outer-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={CYAN} stopOpacity="0.04" />
          <stop offset="100%" stopColor={CYAN} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="back-fog" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={SKY} stopOpacity="0" />
          <stop offset="40%" stopColor={SKY} stopOpacity="0.2" />
          <stop offset="100%" stopColor={SKY} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="horizon-glow" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={CYAN} stopOpacity="0.06" />
          <stop offset="100%" stopColor={CYAN} stopOpacity="0" />
        </linearGradient>
        {/* Mid building gradients — 3 tonal variants (dark bottom → lighter top) */}
        <linearGradient id="mid-grad-0" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#172232" />
          <stop offset="100%" stopColor="#37495e" />
        </linearGradient>
        <linearGradient id="mid-grad-1" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#152030" />
          <stop offset="100%" stopColor="#35475c" />
        </linearGradient>
        <linearGradient id="mid-grad-2" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#1a2636" />
          <stop offset="100%" stopColor="#3a4e64" />
        </linearGradient>
        <mask id="crescent-mask">
          <circle cx={MOON.cx} cy={MOON.cy} r={MOON.r} fill="white" />
          <circle cx={MOON.cutCx} cy={MOON.cutCy} r={MOON.cutR} fill="black" />
        </mask>
      </defs>

      {/* ─── Sky background ─── */}
      <rect width={W} height={H} fill={SKY} />

      {/* ─── Sky elements (static, no scroll) ─── */}
      <StarField />
      <CrescentMoon />

      {/* ─── BACK layer — 300s scroll ─── */}
      <g className="city-layer" style={{ transitionDelay: "0.5s" }}>
        <ScrollLayer speed={SPEED_BACK}>
          <Rects items={BACK_WIDE} fill={BACK_WIDE_CLR} />
          <Rects items={BACK_THIN} fill={BACK_CLR} />
          <BackWindows items={BACK_WIDE_WINDOWS} />
          <BackWindows items={BACK_THIN_WINDOWS} />
        </ScrollLayer>
      </g>

      {/* ─── Atmospheric fog between back and mid layers ─── */}
      <rect x={0} y={85} width={W} height={50} fill="url(#back-fog)" />

      {/* ─── MID layer — 240s scroll, buildings + windows + antennas ─── */}
      <g className="city-layer" style={{ transitionDelay: "0.7s" }}>
        <g
          className="city-scroll-layer"
          style={{ animation: `city-scroll ${SPEED_MID}s linear infinite` }}
        >
          {/* Primary set — gradient buildings + roof edges + animated windows */}
          <MidBuildingRects />
          <MidRoofEdges />
          <Antennas />
          {/* Base ambient glow — static, no animation, visible on layer fade-in */}
          {MID_WINDOWS.filter((_, i) => i % 2 === 0).map((win, i) => (
            <rect
              key={`base-${i}`}
              x={win.x}
              y={win.y}
              width={WIN.mid.w}
              height={WIN.mid.h}
              rx={0.5}
              fill={CYAN}
              opacity={0.08}
            />
          ))}
          {MID_WINDOWS.map((win, i) =>
            win.pulse ? (
              <rect
                key={i}
                x={win.x}
                y={win.y}
                width={WIN.mid.w}
                height={WIN.mid.h}
                rx={0.5}
                fill={CYAN}
                className="win-pulse"
                style={{
                  animation: `win-fade-in 0.8s ease-out ${win.delay}s both, win-pulse ${2.5 + (i % 3) * 0.5}s ease-in-out ${win.delay + 0.8}s infinite`,
                }}
              />
            ) : (
              <rect
                key={i}
                x={win.x}
                y={win.y}
                width={WIN.mid.w}
                height={WIN.mid.h}
                rx={0.5}
                fill={CYAN}
                className="win-fade"
                style={{
                  animation: `win-fade 0.8s ease-out ${win.delay}s both`,
                }}
              />
            ),
          )}

          {/* Duplicate set — static windows for seamless loop */}
          <g transform={`translate(${W}, 0)`}>
            <MidBuildingRects />
            <MidRoofEdges />
            <Antennas />
            {MID_WINDOWS.map((win, i) => (
              <rect
                key={i}
                x={win.x}
                y={win.y}
                width={WIN.mid.w}
                height={WIN.mid.h}
                rx={0.5}
                fill={CYAN}
                opacity={0.6}
              />
            ))}
          </g>
        </g>
      </g>

      {/* ─── FRONT layer — 55s scroll, low silhouettes ─── */}
      <ScrollLayer speed={SPEED_FRONT}>
        <Paths items={FRONT_PATHS} fill={FRONT_CLR} />
      </ScrollLayer>

      {/* ─── Ground line — thin static strip ─── */}
      <rect x={0} y={GROUND_Y} width={W} height={H - GROUND_Y} fill={FRONT_CLR} />

      {/* ─── Horizon glow ─── */}
      <rect x={0} y={H - 40} width={W} height={40} fill="url(#horizon-glow)" />
    </svg>
  );
}
