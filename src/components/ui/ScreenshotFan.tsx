import { useRef, useEffect } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useIsMobile } from "../../hooks/useIsMobile";
import { GRADIENT } from "../../constants/visual-effects";
import { cn } from "../../utils/cn";
import { lerp, clamp } from "../../utils/math";

interface ScreenshotFanProps {
  screenshots: string[];
  projectName: string;
}

// ── Spring transition ──
const SPRING_STIFFNESS = 200;
const SPRING_DAMPING = 28;
const SPRING_TRANSITION = {
  type: "spring",
  stiffness: SPRING_STIFFNESS,
  damping: SPRING_DAMPING,
} as const;

// ── Container & 3D ──
const PERSPECTIVE_PX = "1200px";

// ── Z-index layering ──
const Z_SIDE = 10;
const Z_CENTER = 20;

// ── Compact state (mobile scroll-start) ──
const COMPACT_Z_SIDE = -10;
const COMPACT_Z_CENTER = 10;
const COMPACT_SCALE_SIDE = 0.92;

// ── Staggered opacity reveal thresholds ──
const OPACITY_RANGE_CENTER: [number, number] = [0.0, 0.2];
const OPACITY_RANGE_SIDE: [number, number] = [0.15, 0.35];

// ── Scroll choreography ──
const SCROLL_OFFSET_START = "start 0.85";
const SCROLL_OFFSET_END = "start 0.35";
const SCROLL_REVEAL_Y_PX = 40;
const SCROLL_OPACITY_FRACTION = 0.3;

// ── Glow animation ──
const GLOW_REST = { opacity: 0.4, scale: 0.9 } as const;
const GLOW_SPREAD = { opacity: 1, scale: 1.2 } as const;
const GLOW_SCALE_RANGE: [number, number] = [0.8, 1.2];
const GLOW_TRANSITION_S = 0.5;

// ── Phone dimensions ──
const PHONE_WIDTH_MOBILE = "w-[34%] max-w-[200px]";
const PHONE_WIDTH_DESKTOP = "w-[26%] max-w-[160px]";

// ── Fade overlay ──
const FADE_TRANSITION_S = 0.3;

// ── Device frame classes ──
const DEVICE_SHELL_CLASS =
  "absolute inset-0 rounded-[1.6rem] border-2 border-slate-700/80 bg-slate-900";
const SCREEN_CLASS = "absolute inset-[2px] overflow-hidden rounded-[calc(1.6rem-2px)]";
const NOTCH_CLASS =
  "absolute left-1/2 top-[2px] h-4 w-20 -translate-x-1/2 rounded-b-xl bg-slate-900";
const FADE_OVERLAY_CLASS = "pointer-events-none absolute inset-0 rounded-[1.6rem]";
const GLOW_CLASS =
  "pointer-events-none absolute left-1/2 top-1/2 h-[90%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full";

// ── Side phone shared offsets (mirrored for left/right) ──
const SIDE_CONFIG = {
  rotate: 10,
  x: 34,
  z: -30,
  scale: 0.88,
  spreadX: 72,
  spreadRotate: 16,
  spreadZ: -40,
  spreadScale: 0.92,
} as const;

// ── Framer Motion variants ──
const glowVariants = {
  rest: GLOW_REST,
  spread: GLOW_SPREAD,
};

const fadeOverlayVariants = {
  rest: { opacity: 1 },
  spread: { opacity: 0 },
};

// ── Phone configuration (left · center · right) ──
const PHONE_CONFIG = [
  {
    // Rest & spread (desktop hover)
    rotate: -SIDE_CONFIG.rotate,
    x: -SIDE_CONFIG.x,
    z: SIDE_CONFIG.z,
    scale: SIDE_CONFIG.scale,
    zIndex: Z_SIDE,
    spreadX: -SIDE_CONFIG.spreadX,
    spreadRotate: -SIDE_CONFIG.spreadRotate,
    spreadZ: SIDE_CONFIG.spreadZ,
    spreadScale: SIDE_CONFIG.spreadScale,
    fadeDirection: "left" as const,
    // Compact (mobile scroll start)
    compactX: 0,
    compactRotate: 0,
    compactZ: COMPACT_Z_SIDE,
    compactScale: COMPACT_SCALE_SIDE,
    // Staggered reveal: side phones appear after center
    opacityRange: OPACITY_RANGE_SIDE,
  },
  {
    rotate: 0,
    x: 0,
    z: Z_SIDE,
    scale: 1,
    zIndex: Z_CENTER,
    spreadX: 0,
    spreadRotate: 0,
    spreadZ: 40,
    spreadScale: 1.0,
    fadeDirection: "none" as const,
    compactX: 0,
    compactRotate: 0,
    compactZ: COMPACT_Z_CENTER,
    compactScale: 1,
    // Center phone appears first
    opacityRange: OPACITY_RANGE_CENTER,
  },
  {
    rotate: SIDE_CONFIG.rotate,
    x: SIDE_CONFIG.x,
    z: SIDE_CONFIG.z,
    scale: SIDE_CONFIG.scale,
    zIndex: Z_SIDE,
    spreadX: SIDE_CONFIG.spreadX,
    spreadRotate: SIDE_CONFIG.spreadRotate,
    spreadZ: SIDE_CONFIG.spreadZ,
    spreadScale: SIDE_CONFIG.spreadScale,
    fadeDirection: "right" as const,
    compactX: 0,
    compactRotate: 0,
    compactZ: COMPACT_Z_SIDE,
    compactScale: COMPACT_SCALE_SIDE,
    opacityRange: OPACITY_RANGE_SIDE,
  },
];

type PhoneConfig = (typeof PHONE_CONFIG)[number];

function useScrollPhoneStyle(progress: MotionValue<number>, config: PhoneConfig) {
  const [opacityStart, opacityEnd] = config.opacityRange;

  return {
    rotateY: useTransform(progress, (v) => lerp(config.compactRotate, config.spreadRotate, v)),
    x: useTransform(progress, (v) => `${lerp(config.compactX, config.spreadX, v)}%`),
    z: useTransform(progress, (v) => lerp(config.compactZ, config.spreadZ, v)),
    scale: useTransform(progress, (v) => lerp(config.compactScale, config.spreadScale, v)),
    opacity: useTransform(progress, (v) =>
      clamp((v - opacityStart) / (opacityEnd - opacityStart), 0, 1),
    ),
    y: useTransform(progress, (v) =>
      lerp(SCROLL_REVEAL_Y_PX, 0, clamp(v / SCROLL_OPACITY_FRACTION, 0, 1)),
    ),
  };
}

export default function ScreenshotFan({ screenshots, projectName }: ScreenshotFanProps) {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const isMobile = useIsMobile();

  // Resolve scroll container (document.documentElement for Lenis compatibility)
  useEffect(() => {
    scrollContainerRef.current = document.documentElement;
  }, []);

  // Scroll-linked progress for mobile (0 = entering viewport, 1 = well into view)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    container: scrollContainerRef as React.RefObject<HTMLElement>,
    offset: [SCROLL_OFFSET_START, SCROLL_OFFSET_END],
  });
  const scrollProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Scroll-driven styles (hooks called unconditionally, applied only on mobile)
  const glowOpacity = useTransform(scrollProgress, (v) => v);
  const glowScale = useTransform(scrollProgress, (v) =>
    lerp(GLOW_SCALE_RANGE[0], GLOW_SCALE_RANGE[1], v),
  );
  const fadeOpacity = useTransform(scrollProgress, (v) => 1 - v);

  const phone0Style = useScrollPhoneStyle(scrollProgress, PHONE_CONFIG[0]);
  const phone1Style = useScrollPhoneStyle(scrollProgress, PHONE_CONFIG[1]);
  const phone2Style = useScrollPhoneStyle(scrollProgress, PHONE_CONFIG[2]);
  const phoneScrollStyles = [phone0Style, phone1Style, phone2Style];

  if (screenshots.length !== 3) return null;

  return (
    <motion.div
      ref={containerRef}
      className="relative h-96 w-full"
      style={{ perspective: PERSPECTIVE_PX }}
      initial="rest"
      whileHover={isMobile ? undefined : "spread"}
    >
      {/* Cyan glow background */}
      <motion.div
        className={GLOW_CLASS}
        style={{
          background: GRADIENT.fanGlow,
          ...(isMobile ? { opacity: glowOpacity, scale: glowScale } : {}),
        }}
        variants={isMobile ? undefined : glowVariants}
        transition={{ duration: GLOW_TRANSITION_S, ease: "easeOut" }}
      />

      <div className="absolute inset-0 flex items-center justify-center">
        {screenshots.map((screenshot, index) => {
          const config = PHONE_CONFIG[index];
          const scrollStyle = phoneScrollStyles[index];
          const useSpreadValues = !prefersReducedMotion;

          return (
            <motion.div
              key={screenshot}
              className={cn("absolute", isMobile ? PHONE_WIDTH_MOBILE : PHONE_WIDTH_DESKTOP)}
              style={{
                transformStyle: "preserve-3d",
                zIndex: config.zIndex,
                ...(isMobile ? scrollStyle : {}),
              }}
              variants={
                isMobile
                  ? undefined
                  : {
                      rest: {
                        rotateY: config.rotate,
                        x: `${config.x}%`,
                        z: config.z,
                        scale: config.scale,
                        transition: SPRING_TRANSITION,
                      },
                      spread: {
                        rotateY: useSpreadValues ? config.spreadRotate : config.rotate,
                        x: useSpreadValues ? `${config.spreadX}%` : `${config.x}%`,
                        z: useSpreadValues ? config.spreadZ : config.z,
                        scale: useSpreadValues ? config.spreadScale : config.scale,
                        transition: SPRING_TRANSITION,
                      },
                    }
              }
            >
              {/* Phone device frame */}
              <div className="relative aspect-[9/19.5] w-full">
                {/* Device shell */}
                <div className={DEVICE_SHELL_CLASS} />

                {/* Screen */}
                <div className={SCREEN_CLASS}>
                  <img
                    src={screenshot}
                    alt={`${projectName} – ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Notch */}
                <div className={NOTCH_CLASS} />

                {/* Edge fade overlay for side phones */}
                {config.fadeDirection !== "none" && (
                  <motion.div
                    className={cn(
                      FADE_OVERLAY_CLASS,
                      config.fadeDirection === "left"
                        ? "bg-linear-to-l from-transparent via-transparent to-slate-900/70"
                        : "bg-linear-to-r from-transparent via-transparent to-slate-900/70",
                    )}
                    style={isMobile ? { opacity: fadeOpacity } : undefined}
                    variants={isMobile ? undefined : fadeOverlayVariants}
                    transition={{ duration: FADE_TRANSITION_S }}
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
