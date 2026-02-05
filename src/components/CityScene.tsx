import { type ReactNode, useRef } from "react";
import { useInView } from "framer-motion";
import { cn } from "../utils/cn";
import {
  type Bldg, type MidWin, type BackWin,
  SKY, BACK_CLR, BACK_WIDE_CLR, MID_CLR, MID_GRADS, MID_EDGE_CLR,
  FRONT_CLR, CYAN, STAR_CLR,
  W, H, GROUND_Y,
  SPEED_BACK, SPEED_MID, SPEED_FRONT,
  HASH_A, HASH_B, HASH_C,
  WIN, MOON,
  BACK_WIDE, BACK_THIN,
  MID_BUILDINGS, ANTENNA_INDICES,
  FRONT_PATHS, STARS,
} from "../data/city-scene";

/* ═══════════════════════════════════════════════════════════════════
   CityScene — Animated pixel-art city skyline
   3 scrolling layers (back → mid → front) + ground + sky elements

   All animations are pure CSS (@keyframes + transitions).
   Framer Motion is only used for useInView (lightweight IntersectionObserver).
   Reduced-motion is handled entirely via CSS media query.
   ═══════════════════════════════════════════════════════════════════ */

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
        if (roll > 30) continue;
        wins.push({
          x: b.x + 6 + c * g.gap,
          y: H - b.h + 8 + r * g.rowGap,
          pulse: roll < 12,
          delay: baseDelay + r * 0.08,
        });
      }
    }
    const bWins = wins.slice(startIdx);
    const pulseCount = bWins.filter((w) => w.pulse).length;
    for (let p = pulseCount; p < 2 && startIdx + p < wins.length; p++) {
      wins[startIdx + p].pulse = true;
    }
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

function MidBuildingRects() {
  return (
    <>
      {MID_BUILDINGS.map((b, i) =>
        b.path ? (
          <path key={i} d={b.path} fill={MID_GRADS[i % 3]} />
        ) : (
          <rect key={i} x={b.x} y={H - b.h} width={b.w} height={b.h} fill={MID_GRADS[i % 3]} />
        ),
      )}
    </>
  );
}

function MidRoofEdges() {
  return (
    <>
      {MID_BUILDINGS.map((b, i) =>
        b.roofEdge ? (
          <path key={i} d={b.roofEdge} stroke={MID_EDGE_CLR} strokeWidth={1} fill="none" opacity={0.6} />
        ) : (
          <rect key={i} x={b.x} y={H - b.h} width={b.w} height={1} fill={MID_EDGE_CLR} opacity={0.6} />
        ),
      )}
    </>
  );
}

function Rects({ items, fill }: { items: Bldg[]; fill: string }) {
  return (
    <>
      {items.map((b, i) => (
        <rect key={i} x={b.x} y={H - b.h} width={b.w} height={b.h} fill={fill} />
      ))}
    </>
  );
}

function Paths({ items, fill }: { items: string[]; fill: string }) {
  return (
    <>
      {items.map((d, i) => (
        <path key={i} d={d} fill={fill} />
      ))}
    </>
  );
}

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

function ScrollLayer({ speed, children }: { speed: number; children: ReactNode }) {
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
      className={cn("city-scene", hasFadedIn && "faded-in", className)}
      preserveAspectRatio="xMidYMax slice"
      overflow="hidden"
      aria-hidden="true"
    >
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

      {/* ─── BACK layer ─── */}
      <g className="city-layer" style={{ transitionDelay: "0.5s" }}>
        <ScrollLayer speed={SPEED_BACK}>
          <Rects items={BACK_WIDE} fill={BACK_WIDE_CLR} />
          <Rects items={BACK_THIN} fill={BACK_CLR} />
          <BackWindows items={BACK_WIDE_WINDOWS} />
          <BackWindows items={BACK_THIN_WINDOWS} />
        </ScrollLayer>
      </g>

      {/* ─── Atmospheric fog ─── */}
      <rect x={0} y={85} width={W} height={50} fill="url(#back-fog)" />

      {/* ─── MID layer ─── */}
      <g className="city-layer" style={{ transitionDelay: "0.7s" }}>
        <g
          className="city-scroll-layer"
          style={{ animation: `city-scroll ${SPEED_MID}s linear infinite` }}
        >
          <MidBuildingRects />
          <MidRoofEdges />
          <Antennas />
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

      {/* ─── FRONT layer ─── */}
      <ScrollLayer speed={SPEED_FRONT}>
        <Paths items={FRONT_PATHS} fill={FRONT_CLR} />
      </ScrollLayer>

      {/* ─── Ground line ─── */}
      <rect x={0} y={GROUND_Y} width={W} height={H - GROUND_Y} fill={FRONT_CLR} />

      {/* ─── Horizon glow ─── */}
      <rect x={0} y={H - 40} width={W} height={40} fill="url(#horizon-glow)" />
    </svg>
  );
}
