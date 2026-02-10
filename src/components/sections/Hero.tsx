import { lazy, Suspense, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, useScroll, useTransform, useReducedMotion, useMotionValueEvent } from "framer-motion";
import { useLenis } from "lenis/react";
import { GRADIENT } from "../../constants/visual-effects";
import { EASE_OUT_EXPO } from "../../constants/animation";
import { NAV_HEIGHT } from "../../constants/layout";
import ErrorBoundary from "../ui/ErrorBoundary";
import { cn } from "../../utils/cn";

const HeroParticles = lazy(() => import("../effects/HeroParticles"));

/** Extra scroll height for the pinned transition (100vh hero + 150vh animation) */
const HERO_SCROLL_HEIGHT = "250vh";

// ── Entrance animation timing ──
const WORD_BASE_DELAY_S = 0.3;
const WORD_STAGGER_S = 0.12;
const WORD_DURATION_S = 0.8;
const LINE_DURATION_S = 0.7;
const SUBTITLE_OFFSET_S = 0.2;
const INDICATOR_OFFSET_S = 1;
const NAME_TO_TITLE_GAP_S = 0.3;
const CHEVRON_COUNT = 3;
const CHEVRON_DURATION_S = 1.8;
const CHEVRON_STAGGER_S = 0.25;
const CHEVRON_STROKE = "rgba(34,211,238,0.9)";

// ── Scroll choreography — progress thresholds ──
const TEXT_FADE: [number, number] = [0.05, 0.25];
const TEXT_Y_RANGE: [number, number] = [0, 0.4];
const TEXT_SCALE_RANGE: [number, number] = [0, 0.3];
const TEXT_SCALE_MIN = 0.85;
const TEXT_BLUR_MAX_PX = 12;
const GLOW_Y_RANGE: [number, number] = [0, 0.5];
const GLOW_FADE_END = 0.3;
const PARTICLE_FADE: [number, number] = [0.35, 0.55];
const INDICATOR_FADE_END = 0.06;
const CANVAS_PAUSE_THRESHOLD = 0.6;

const wordVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: WORD_DURATION_S,
      delay: WORD_BASE_DELAY_S + i * WORD_STAGGER_S,
      ease: EASE_OUT_EXPO,
    },
  }),
};

/** Spotlight glow positions — radial gradient orbs behind the hero text */
const HERO_SPOTLIGHTS = [
  { left: "48%", top: "42%", size: "600px", gradient: GRADIENT.spotlightCyan },
  { left: "68%", top: "58%", size: "480px", gradient: GRADIENT.spotlightBlue },
  { left: "28%", top: "30%", size: "420px", gradient: GRADIENT.spotlightTeal },
] as const;

const lineVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: LINE_DURATION_S, delay, ease: EASE_OUT_EXPO },
  }),
};

export default function Hero() {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  const lenis = useLenis();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const nameWords = t("hero.name").split(" ");
  const nameDelay = WORD_BASE_DELAY_S + nameWords.length * WORD_STAGGER_S + NAME_TO_TITLE_GAP_S;

  // Track scroll progress through the extended wrapper (250vh)
  // 0 = wrapper top at viewport top, 1 = wrapper bottom at viewport top
  // Hero stays sticky for progress 0→CANVAS_PAUSE_THRESHOLD (150vh of scroll)
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end start"],
  });

  // ── Text layer: blur recession (recedes into space) ──
  const textY = useTransform(scrollYProgress, TEXT_Y_RANGE, ["0%", "-15%"]);
  const textOpacity = useTransform(scrollYProgress, TEXT_FADE, [1, 0]);
  const textScale = useTransform(scrollYProgress, TEXT_SCALE_RANGE, [1, TEXT_SCALE_MIN]);
  const textBlur = useTransform(scrollYProgress, TEXT_FADE, [0, TEXT_BLUR_MAX_PX]);
  const textFilter = useTransform(textBlur, (v) => `blur(${v}px)`);

  // ── Spotlight layer: fades with text ──
  const glowY = useTransform(scrollYProgress, GLOW_Y_RANGE, ["0%", "-25%"]);
  const glowOpacity = useTransform(scrollYProgress, [TEXT_FADE[0], GLOW_FADE_END], [1, 0]);

  // ── Particles: fade later, after camera dive is underway ──
  const particleOpacity = useTransform(scrollYProgress, PARTICLE_FADE, [1, 0]);

  // ── Scroll indicator: vanishes immediately ──
  const indicatorOpacity = useTransform(scrollYProgress, [0, INDICATOR_FADE_END], [1, 0]);

  // Bridge FM scroll progress → R3F via ref (MotionValues don't work inside Canvas)
  const scrollRef = useRef(0);
  const [canvasPaused, setCanvasPaused] = useState(false);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    scrollRef.current = v;
    setCanvasPaused(v > CANVAS_PAUSE_THRESHOLD);
  });

  const skip = !!prefersReducedMotion;

  const scrollToAbout = () => {
    const el = document.getElementById("about");
    if (el) {
      if (lenis) {
        lenis.scrollTo(el, { offset: -NAV_HEIGHT });
      } else {
        const top = el.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }
  };

  return (
    <div ref={wrapperRef} style={skip ? undefined : { height: HERO_SCROLL_HEIGHT }}>
      <section
        className={cn("relative flex h-screen items-center justify-center px-6", !skip && "sticky top-0 overflow-hidden")}
      >
        {/* Spotlight glow — radial gradients (performant replacement for blur filters) */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={skip ? undefined : { y: glowY, opacity: glowOpacity, willChange: "transform, opacity" }}
        >
          {HERO_SPOTLIGHTS.map((spot, i) => (
            <div
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                left: spot.left,
                top: spot.top,
                width: spot.size,
                height: spot.size,
                background: spot.gradient,
              }}
            />
          ))}
        </motion.div>

        {/* Particle constellation behind text */}
        <motion.div
          style={skip ? undefined : { opacity: particleOpacity, willChange: "opacity" }}
        >
          <ErrorBoundary fallback={null}>
            <Suspense fallback={null}>
              <HeroParticles scrollRef={scrollRef} paused={canvasPaused} />
            </Suspense>
          </ErrorBoundary>
        </motion.div>

        <motion.div
          className="relative max-w-4xl text-center"
          style={skip ? undefined : { y: textY, opacity: textOpacity, scale: textScale, filter: textFilter, willChange: "transform, opacity, filter" }}
        >
          {/* Greeting */}
          <motion.p
            custom={0.1}
            initial="hidden"
            animate="visible"
            variants={lineVariants}
            className="mb-6 text-sm font-medium tracking-[0.3em] text-cyan-400 uppercase"
          >
            {t("hero.greeting")}
          </motion.p>

          {/* Name — word by word reveal with blur */}
          <h1 className="mb-6 text-5xl font-bold leading-tight text-white md:text-7xl lg:text-8xl">
            {nameWords.map((word, i) => (
              <motion.span
                key={i}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={wordVariants}
                style={{ willChange: "filter, transform, opacity" }}
                className="mr-[0.3em] inline-block last:mr-0"
              >
                {word}
              </motion.span>
            ))}
          </h1>

          {/* Title with gradient */}
          <motion.p
            custom={nameDelay}
            initial="hidden"
            animate="visible"
            variants={lineVariants}
            className="mb-6 bg-linear-to-r from-slate-200 to-slate-400 bg-clip-text text-xl font-medium text-transparent md:text-2xl"
          >
            {t("hero.title")}
          </motion.p>

          {/* Subtitle */}
          <motion.p
            custom={nameDelay + SUBTITLE_OFFSET_S}
            initial="hidden"
            animate="visible"
            variants={lineVariants}
            className="mx-auto max-w-xl text-slate-400"
          >
            {t("hero.subtitle")}
          </motion.p>

          {/* Scroll indicator — clickable, scrolls to About */}
          <motion.button
            onClick={scrollToAbout}
            aria-label="Scroll to content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.15 }}
            transition={{ delay: nameDelay + INDICATOR_OFFSET_S, duration: INDICATOR_OFFSET_S }}
            style={skip ? undefined : { opacity: indicatorOpacity }}
            className="mx-auto mt-20 flex cursor-pointer flex-col items-center gap-2 p-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-400"
          >
            <div className="relative flex flex-col items-center gap-1.5" aria-hidden="true">
              {Array.from({ length: CHEVRON_COUNT }, (_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    opacity: [0, 1, 0],
                    y: [0, 8, 16],
                  }}
                  transition={{
                    duration: CHEVRON_DURATION_S,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * CHEVRON_STAGGER_S,
                  }}
                >
                  <svg
                    width="24"
                    height="12"
                    viewBox="0 0 24 12"
                    fill="none"
                  >
                    <path
                      d="M1 1L12 10L23 1"
                      stroke={CHEVRON_STROKE}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.div>
              ))}
            </div>
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
}
