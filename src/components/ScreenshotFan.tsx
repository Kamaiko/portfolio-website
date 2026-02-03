import { useRef, useEffect, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

interface ScreenshotFanProps {
  screenshots: string[];
  projectName: string;
}

const SPRING_TRANSITION = { type: "spring", stiffness: 260, damping: 22 } as const;

const SIDE_CONFIG = {
  rotate: 10,
  x: "34%",
  z: -30,
  scale: 0.88,
  spreadX: "58%",
  spreadRotate: 14,
  spreadZ: -40,
  spreadScale: 0.9,
} as const;

const phoneConfig = [
  {
    rotate: -SIDE_CONFIG.rotate,
    x: `-${SIDE_CONFIG.x.replace("-", "")}`,
    z: SIDE_CONFIG.z,
    scale: SIDE_CONFIG.scale,
    zIndex: 10,
    spreadX: `-${SIDE_CONFIG.spreadX.replace("-", "")}`,
    spreadRotate: -SIDE_CONFIG.spreadRotate,
    spreadZ: SIDE_CONFIG.spreadZ,
    spreadScale: SIDE_CONFIG.spreadScale,
    fadeDirection: "left" as const,
  },
  {
    rotate: 0,
    x: "0%",
    z: 10,
    scale: 1,
    zIndex: 20,
    spreadX: "0%",
    spreadRotate: 0,
    spreadZ: 40,
    spreadScale: 1.05,
    fadeDirection: "none" as const,
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
  },
];

const MOBILE_QUERY = "(max-width: 767px)";

export default function ScreenshotFan({ screenshots, projectName }: ScreenshotFanProps) {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia(MOBILE_QUERY).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  if (screenshots.length !== 3) return null;

  const shouldSpread = isMobile && isInView;

  return (
    <motion.div
      ref={containerRef}
      className="relative h-96 w-full"
      style={{ perspective: "1200px" }}
      initial="rest"
      animate={shouldSpread ? "spread" : undefined}
      whileHover={isMobile ? undefined : "spread"}
    >
      {/* Cyan glow background */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[90%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: "radial-gradient(ellipse at center, rgba(34,211,238,0.12) 0%, transparent 70%)",
        }}
        variants={{
          rest: { opacity: 0.4, scale: 0.9 },
          spread: { opacity: 1, scale: 1.2 },
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />

      <div className="absolute inset-0 flex items-center justify-center">
        {screenshots.map((screenshot, index) => {
          const config = phoneConfig[index];
          const useSpreadValues = !prefersReducedMotion;

          return (
            <motion.div
              key={screenshot}
              className="absolute w-[30%] max-w-[180px]"
              style={{
                transformStyle: "preserve-3d",
                zIndex: config.zIndex,
              }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.6,
                delay: prefersReducedMotion ? 0 : index * 0.12,
              }}
              variants={{
                rest: {
                  rotateY: config.rotate,
                  x: config.x,
                  z: config.z,
                  scale: config.scale,
                  transition: SPRING_TRANSITION,
                },
                spread: {
                  rotateY: useSpreadValues ? config.spreadRotate : config.rotate,
                  x: useSpreadValues ? config.spreadX : config.x,
                  z: useSpreadValues ? config.spreadZ : config.z,
                  scale: useSpreadValues ? config.spreadScale : config.scale,
                  transition: {
                    ...SPRING_TRANSITION,
                    delay: isMobile ? 0.4 : 0,
                  },
                },
              }}
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
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Notch */}
                <div className="absolute left-1/2 top-[2px] h-4 w-20 -translate-x-1/2 rounded-b-xl bg-slate-900" />

                {/* Edge fade overlay for side phones (rest state) */}
                {config.fadeDirection !== "none" && (
                  <motion.div
                    className={`pointer-events-none absolute inset-0 rounded-[1.6rem] ${
                      config.fadeDirection === "left"
                        ? "bg-linear-to-l from-transparent via-transparent to-slate-900/70"
                        : "bg-linear-to-r from-transparent via-transparent to-slate-900/70"
                    }`}
                    variants={{
                      rest: { opacity: 1 },
                      spread: { opacity: 0 },
                    }}
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
