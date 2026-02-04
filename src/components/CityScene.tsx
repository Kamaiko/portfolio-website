import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

/* ─── Palette ─── */
const SKY = "#0c1222";
const MID_BLDG = "#1e293b"; // slate-800
const FG_BLDG = "#283548"; // slate-700ish — windowed layer
const FRONT_BLDG = "#0a1018"; // near-black — closest silhouettes
const WIN_ON = "#22d3ee"; // cyan-400
const STAR_CLR = "#e2e8f0"; // slate-200

const VIEW_W = 800;
const VIEW_H = 160;
const GROUND_Y = VIEW_H;

/* ─── Building rectangles per layer ─── */
interface Bldg {
  x: number;
  w: number;
  h: number;
}

/** Mid layer — distant skyline, thin towers + wide lows, very slow scroll */
const MID_PATHS: string[] = [
  // Thin tower
  "M15,160 V95 H35 V160 Z",
  // Wide low block
  "M70,160 V135 H140 V160 Z",
  // Narrow tall tower
  "M185,160 V88 H205 V160 Z",
  // Small thin tower
  "M260,160 V110 H278 V160 Z",
  // Wide low structure
  "M330,160 V140 H400 V160 Z",
  // Tall narrow tower
  "M450,160 V92 H472 V160 Z",
  // Medium thin tower
  "M530,160 V105 H550 V160 Z",
  // Wide low
  "M600,160 V132 H660 V160 Z",
  // Narrow tall
  "M710,160 V90 H728 V160 Z",
  // Small tower at edge
  "M775,160 V115 H795 V160 Z",
];

/** Foreground layer — has windows + antenna details, scrolls slowly */
const FG: Bldg[] = [
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

/** Front silhouette layer — varied heights, smooth shapes, fastest scroll */
const FRONT_PATHS: string[] = [
  // Tall block — 50px
  "M-10,160 V110 H30 V160 Z",
  // Two overlapping buildings — short + tall (gap: 45px)
  "M75,160 V138 H105 V120 H130 V160 Z",
  // Low wide — 18px (gap: 60px)
  "M190,160 V142 H250 V160 Z",
  // Tallest narrow — 55px (gap: 50px)
  "M300,160 V105 H330 V160 Z",
  // Stepped duo — tall+short overlap (gap: 50px)
  "M380,160 V118 H410 V135 H440 V160 Z",
  // Medium block — 30px (gap: 80px)
  "M520,160 V130 H560 V160 Z",
  // Tall with shoulder — 45px (gap: 50px)
  "M610,160 V140 H630 V115 H660 V160 Z",
  // Low bump — 15px (gap: 50px)
  "M710,160 V145 H760 V160 Z",
  // Edge block — 35px (gap: 30px)
  "M790,160 V125 H820 V160 Z",
];

/** Antenna positions — index into FG array for buildings that get antennas */
const ANTENNAS = [1, 3, 5, 7, 9];

/* ─── Window generation ─── */
interface Win {
  x: number;
  y: number;
  pulse: boolean;
}

function generateWindows(): Win[] {
  const wins: Win[] = [];
  FG.forEach((b, bIdx) => {
    const cols = Math.floor((b.w - 8) / 10);
    const rows = Math.floor((b.h - 10) / 12);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const seed = (bIdx * 100 + r * 10 + c) * 2654435761;
        if ((seed >>> 0) % 100 > 30) continue;
        wins.push({
          x: b.x + 6 + c * 10,
          y: GROUND_Y - b.h + 8 + r * 12,
          pulse: (seed >>> 0) % 100 < 8,
        });
      }
    }
  });
  return wins;
}

const WINDOWS = generateWindows();

/* ─── Stars — ~20 stars, varying sizes ─── */
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
  // Lower zone stars (between sky and rooftops)
  { cx: 160, cy: 72, r: 0.4 },
  { cx: 390, cy: 78, r: 0.3 },
  { cx: 540, cy: 68, r: 0.5 },
  { cx: 700, cy: 75, r: 0.3 },
  { cx: 440, cy: 82, r: 0.4 },
];

/* ─── Helpers ─── */
/** Render a layer of buildings as static rects */
function BuildingLayer({ buildings, fill }: { buildings: Bldg[]; fill: string }) {
  return (
    <>
      {buildings.map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={GROUND_Y - b.h}
          width={b.w}
          height={b.h}
          fill={fill}
        />
      ))}
    </>
  );
}

/** Render a layer of SVG path silhouettes */
function PathLayer({ paths, fill }: { paths: string[]; fill: string }) {
  return (
    <>
      {paths.map((d, i) => (
        <path key={i} d={d} fill={fill} />
      ))}
    </>
  );
}

/* ─── Component ─── */
interface CitySceneProps {
  className?: string;
}

export default function CityScene({ className }: CitySceneProps) {
  const ref = useRef<SVGSVGElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = isInView && !prefersReducedMotion;

  const midScrollStyle = shouldAnimate
    ? { animation: "city-scroll 300s linear infinite" }
    : undefined;

  const fgScrollStyle = shouldAnimate
    ? { animation: "city-scroll 240s linear infinite" }
    : undefined;

  const frontScrollStyle = shouldAnimate
    ? { animation: "city-scroll 55s linear infinite" }
    : undefined;

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className={className}
      preserveAspectRatio="xMidYMax slice"
      overflow="hidden"
      aria-hidden="true"
    >
      {/* Sky */}
      <rect width={VIEW_W} height={VIEW_H} fill={SKY} />

      {/* Stars — static position, twinkling animation */}
      {STARS.map((s, i) => (
        <motion.circle
          key={`s-${i}`}
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          fill={STAR_CLR}
          initial={{ opacity: prefersReducedMotion ? 0.7 : 0 }}
          animate={
            shouldAnimate
              ? { opacity: [0, 0.9, 0.25, 0.9] }
              : prefersReducedMotion
                ? { opacity: 0.7 }
                : undefined
          }
          transition={
            shouldAnimate
              ? {
                  delay: 0.3 + i * 0.12,
                  duration: 2.5 + (i % 4),
                  repeat: Infinity,
                  repeatType: "mirror" as const,
                  ease: "easeInOut",
                }
              : undefined
          }
        />
      ))}

      {/* ── MID layer — distant industrial skyline, very slow scroll ── */}
      <motion.g
        initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
        animate={shouldAnimate || prefersReducedMotion ? { opacity: 1 } : undefined}
        transition={shouldAnimate ? { delay: 0.2, duration: 0.8 } : undefined}
      >
        <g style={midScrollStyle}>
          <PathLayer paths={MID_PATHS} fill={MID_BLDG} />
          <g transform={`translate(${VIEW_W}, 0)`}>
            <PathLayer paths={MID_PATHS} fill={MID_BLDG} />
          </g>
        </g>
      </motion.g>

      {/* ── FG layer — buildings + windows + antennas, slow scroll ── */}
      <motion.g
        initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
        animate={shouldAnimate || prefersReducedMotion ? { opacity: 1 } : undefined}
        transition={shouldAnimate ? { delay: 0.4, duration: 0.8 } : undefined}
      >
        <g style={fgScrollStyle}>
          {/* Original set */}
          <BuildingLayer buildings={FG} fill={FG_BLDG} />
          {ANTENNAS.map((idx) => {
            const b = FG[idx];
            const tipX = b.x + b.w / 2;
            const baseY = GROUND_Y - b.h;
            return (
              <g key={`ant-${idx}`}>
                <rect x={tipX - 0.8} y={baseY - 12} width={1.6} height={12} fill={FG_BLDG} />
                <circle cx={tipX} cy={baseY - 13} r={1.2} fill={WIN_ON} opacity={0.6} />
              </g>
            );
          })}
          {WINDOWS.map((win, i) =>
            win.pulse ? (
              <motion.rect
                key={`w-${i}`}
                x={win.x}
                y={win.y}
                width={5}
                height={7}
                rx={0.5}
                fill={WIN_ON}
                initial={{ opacity: prefersReducedMotion ? 0.6 : 0 }}
                animate={
                  shouldAnimate || prefersReducedMotion
                    ? { opacity: [0.2, 0.85, 0.2] }
                    : undefined
                }
                transition={
                  shouldAnimate
                    ? {
                        delay: 1.2 + i * 0.4,
                        duration: 2.5 + (i % 3) * 0.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }
                    : undefined
                }
              />
            ) : (
              <motion.rect
                key={`w-${i}`}
                x={win.x}
                y={win.y}
                width={5}
                height={7}
                rx={0.5}
                fill={WIN_ON}
                initial={{ opacity: prefersReducedMotion ? 0.6 : 0 }}
                animate={
                  shouldAnimate
                    ? { opacity: 0.6 }
                    : prefersReducedMotion
                      ? { opacity: 0.6 }
                      : undefined
                }
                transition={
                  shouldAnimate
                    ? { delay: 0.6 + i * 0.04, duration: 0.4 }
                    : undefined
                }
              />
            ),
          )}

          {/* Duplicate set at +VIEW_W for seamless loop */}
          <g transform={`translate(${VIEW_W}, 0)`}>
            <BuildingLayer buildings={FG} fill={FG_BLDG} />
            {ANTENNAS.map((idx) => {
              const b = FG[idx];
              const tipX = b.x + b.w / 2;
              const baseY = GROUND_Y - b.h;
              return (
                <g key={`ant2-${idx}`}>
                  <rect x={tipX - 0.8} y={baseY - 12} width={1.6} height={12} fill={FG_BLDG} />
                  <circle cx={tipX} cy={baseY - 13} r={1.2} fill={WIN_ON} opacity={0.6} />
                </g>
              );
            })}
            {/* Duplicate windows — static opacity for the copy */}
            {WINDOWS.map((win, i) => (
              <rect
                key={`w2-${i}`}
                x={win.x}
                y={win.y}
                width={5}
                height={7}
                rx={0.5}
                fill={WIN_ON}
                opacity={0.6}
              />
            ))}
          </g>
        </g>
      </motion.g>

      {/* ── FRONT silhouette layer — varied shapes, fastest scroll ── */}
      <g style={frontScrollStyle}>
        <PathLayer paths={FRONT_PATHS} fill={FRONT_BLDG} />
        <g transform={`translate(${VIEW_W}, 0)`}>
          <PathLayer paths={FRONT_PATHS} fill={FRONT_BLDG} />
        </g>
      </g>

      {/* Horizon glow */}
      <defs>
        <linearGradient id="horizon-glow" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect
        x={0}
        y={GROUND_Y - 40}
        width={VIEW_W}
        height={40}
        fill="url(#horizon-glow)"
      />
    </svg>
  );
}
