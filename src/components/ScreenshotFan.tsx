import { useRef, useEffect } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useIsMobile } from "../hooks/useIsMobile";
import { GRADIENT } from "../constants/visual-effects";

interface ScreenshotFanProps {
  screenshots: string[];
  projectName: string;
}

const SPRING_TRANSITION = { type: "spring", stiffness: 200, damping: 28 } as const;

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

const phoneConfig = [
  {
    // Rest & spread (desktop hover)
    rotate: -SIDE_CONFIG.rotate,
    x: -SIDE_CONFIG.x,
    z: SIDE_CONFIG.z,
    scale: SIDE_CONFIG.scale,
    zIndex: 10,
    spreadX: -SIDE_CONFIG.spreadX,
    spreadRotate: -SIDE_CONFIG.spreadRotate,
    spreadZ: SIDE_CONFIG.spreadZ,
    spreadScale: SIDE_CONFIG.spreadScale,
    fadeDirection: "left" as const,
    // Compact (mobile scroll start)
    compactX: 0,
    compactRotate: 0,
    compactZ: -10,
    compactScale: 0.92,
    // Staggered reveal: side phones appear after center
    opacityRange: [0.15, 0.35] as [number, number],
  },
  {
    rotate: 0,
    x: 0,
    z: 10,
    scale: 1,
    zIndex: 20,
    spreadX: 0,
    spreadRotate: 0,
    spreadZ: 40,
    spreadScale: 1.0,
    fadeDirection: "none" as const,
    compactX: 0,
    compactRotate: 0,
    compactZ: 10,
    compactScale: 1,
    // Center phone appears first
    opacityRange: [0.0, 0.2] as [number, number],
  },
  {
    rotate: SIDE_CONFIG.rotate,
    x: SIDE_CONFIG.x,
    z: SIDE_CONFIG.z,
    scale: SIDE_CONFIG.scale,
    zIndex: 10,
    spreadX: SIDE_CONFIG.spreadX,
    spreadRotate: SIDE_CONFIG.spreadRotate,
    spreadZ: SIDE_CONFIG.spreadZ,
    spreadScale: SIDE_CONFIG.spreadScale,
    fadeDirection: "right" as const,
    compactX: 0,
    compactRotate: 0,
    compactZ: -10,
    compactScale: 0.92,
    opacityRange: [0.15, 0.35] as [number, number],
  },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

type PhoneConfig = (typeof phoneConfig)[number];

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
    y: useTransform(progress, (v) => lerp(40, 0, clamp(v / 0.3, 0, 1))),
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
    offset: ["start 0.85", "start 0.35"],
  });
  const scrollProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Scroll-driven styles (hooks called unconditionally, applied only on mobile)
  const glowOpacity = useTransform(scrollProgress, (v) => lerp(0, 1, v));
  const glowScale = useTransform(scrollProgress, (v) => lerp(0.8, 1.2, v));
  const fadeOpacity = useTransform(scrollProgress, (v) => lerp(1, 0, v));

  const phone0Style = useScrollPhoneStyle(scrollProgress, phoneConfig[0]);
  const phone1Style = useScrollPhoneStyle(scrollProgress, phoneConfig[1]);
  const phone2Style = useScrollPhoneStyle(scrollProgress, phoneConfig[2]);
  const phoneScrollStyles = [phone0Style, phone1Style, phone2Style];

  if (screenshots.length !== 3) return null;

  return (
    <motion.div
      ref={containerRef}
      className="relative h-96 w-full"
      style={{ perspective: "1200px" }}
      initial="rest"
      whileHover={isMobile ? undefined : "spread"}
    >
      {/* Cyan glow background */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[90%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: GRADIENT.fanGlow,
          ...(isMobile ? { opacity: glowOpacity, scale: glowScale } : {}),
        }}
        variants={
          isMobile
            ? undefined
            : {
                rest: { opacity: 0.4, scale: 0.9 },
                spread: { opacity: 1, scale: 1.2 },
              }
        }
        transition={{ duration: 0.5, ease: "easeOut" }}
      />

      <div className="absolute inset-0 flex items-center justify-center">
        {screenshots.map((screenshot, index) => {
          const config = phoneConfig[index];
          const scrollStyle = phoneScrollStyles[index];
          const useSpreadValues = !prefersReducedMotion;

          return (
            <motion.div
              key={screenshot}
              className={`absolute ${isMobile ? "w-[34%] max-w-[200px]" : "w-[26%] max-w-[160px]"}`}
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
                <div className="absolute inset-0 rounded-[1.6rem] border-2 border-slate-700/80 bg-slate-900" />

                {/* Screen */}
                <div className="absolute inset-[2px] overflow-hidden rounded-[calc(1.6rem-2px)]">
                  <img
                    src={screenshot}
                    alt={`${projectName} – ${index + 1}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* Notch */}
                <div className="absolute left-1/2 top-[2px] h-4 w-20 -translate-x-1/2 rounded-b-xl bg-slate-900" />

                {/* Edge fade overlay for side phones */}
                {config.fadeDirection !== "none" && (
                  <motion.div
                    className={`pointer-events-none absolute inset-0 rounded-[1.6rem] ${
                      config.fadeDirection === "left"
                        ? "bg-linear-to-l from-transparent via-transparent to-slate-900/70"
                        : "bg-linear-to-r from-transparent via-transparent to-slate-900/70"
                    }`}
                    style={isMobile ? { opacity: fadeOpacity } : undefined}
                    variants={
                      isMobile
                        ? undefined
                        : {
                            rest: { opacity: 1 },
                            spread: { opacity: 0 },
                          }
                    }
                    transition={{ duration: 0.3 }}
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
