import { lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { GRADIENT } from "../constants/visual-effects";
import ErrorBoundary from "./ErrorBoundary";

const HeroParticles = lazy(() => import("./effects/HeroParticles"));

const EASE_OUT_EXPO = [0.25, 0.46, 0.45, 0.94] as const;

const wordVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      delay: 0.3 + i * 0.12,
      ease: EASE_OUT_EXPO,
    },
  }),
};

const lineVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: EASE_OUT_EXPO },
  }),
};

export default function Hero() {
  const { t } = useTranslation();
  const nameWords = t("hero.name").split(" ");
  const nameDelay = 0.3 + nameWords.length * 0.12 + 0.3;

  return (
    <section
      className="relative flex min-h-screen items-center justify-center px-6"
    >
      {/* Spotlight glow — radial gradients (performant replacement for blur filters) */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-[48%] top-[42%] h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: GRADIENT.spotlightCyan }}
        />
        <div
          className="absolute left-[68%] top-[58%] h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: GRADIENT.spotlightBlue }}
        />
        <div
          className="absolute left-[28%] top-[30%] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: GRADIENT.spotlightTeal }}
        />
      </div>

      {/* Particle constellation behind text */}
      <ErrorBoundary fallback={null}>
        <Suspense fallback={null}>
          <HeroParticles />
        </Suspense>
      </ErrorBoundary>

      <div className="relative max-w-4xl text-center">
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
          custom={nameDelay + 0.2}
          initial="hidden"
          animate="visible"
          variants={lineVariants}
          className="mx-auto max-w-xl text-slate-400"
        >
          {t("hero.subtitle")}
        </motion.p>

        {/* Scroll indicator — mouse icon */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: nameDelay + 1, duration: 1 }}
          className="mt-20 flex flex-col items-center gap-2"
        >
          <div className="relative flex flex-col items-center gap-1" aria-hidden="true">
            {/* Animated chevrons */}
            {[0, 1, 2].map((i) => (
              <motion.svg
                key={i}
                width="16"
                height="8"
                viewBox="0 0 16 8"
                fill="none"
                animate={{
                  opacity: [0, 0.8, 0],
                  y: [0, 6, 12],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.25,
                }}
              >
                <path
                  d="M1 1L8 6L15 1"
                  stroke="rgba(34,211,238,0.7)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
