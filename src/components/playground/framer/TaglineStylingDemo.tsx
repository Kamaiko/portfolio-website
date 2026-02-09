import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import DemoSection from "../DemoSection";
import { cn } from "../../../utils/cn";
import { CARD_BASE, CARD_SHADOW_LIGHT } from "../../../constants/styles";

/* ═══════════════════════════════════════════════════════════════════
   Demo 5: Tagline Blur Reveal — Segmented animation prototype
   3 segments blur-reveal in sequence, keywords "punch" on appear.
   ═══════════════════════════════════════════════════════════════════ */

const cardClass = cn(CARD_BASE, CARD_SHADOW_LIGHT, "p-6");

const SEGMENT_DELAY_S = 0.45;

const blurReveal = {
  hidden: { filter: "blur(8px)", opacity: 0, y: 12 },
  visible: (delay: number) => ({
    filter: "blur(0px)",
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

const keywordPunch = {
  hidden: { scale: 1 },
  visible: (delay: number) => ({
    scale: [1, 1.08, 1],
    transition: { duration: 0.35, delay: delay + 0.3, ease: "easeOut" as const },
  }),
};

function AnimatedTagline() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const skip = !!useReducedMotion();
  const [glowActive, setGlowActive] = useState(false);

  const animate = skip ? "visible" : isInView ? "visible" : "hidden";

  return (
    <div
      ref={ref}
      className={cn("tagline-glow", glowActive && "glow-active")}
    >
      <p className="text-xl leading-relaxed text-slate-300 md:text-2xl">
        {/* ── Segment 1: "Diplômé en psycho," ── */}
        <motion.span
          className="inline"
          variants={blurReveal}
          initial="hidden"
          animate={animate}
          custom={0}
        >
          Diplômé en{" "}
          <motion.span
            className="glow-pulse text-[1.15em] text-cyan-400"
            variants={keywordPunch}
            initial="hidden"
            animate={animate}
            custom={0}
          >
            psycho
          </motion.span>
          ,{" "}
        </motion.span>

        {/* ── Segment 2: "reconverti en dev." ── */}
        <motion.span
          className="inline"
          variants={blurReveal}
          initial="hidden"
          animate={animate}
          custom={SEGMENT_DELAY_S}
          onAnimationComplete={() => {
            if (!skip) {
              setTimeout(() => setGlowActive(true), 400);
            }
          }}
        >
          reconverti en{" "}
          <motion.span
            className="glow-pulse text-[1.15em] text-cyan-400"
            variants={keywordPunch}
            initial="hidden"
            animate={animate}
            custom={SEGMENT_DELAY_S}
          >
            dev
          </motion.span>
          .
        </motion.span>

        {/* ── Segment 3: Subtitle with "utilisateurs" ── */}
        <motion.span
          className="mt-1 block text-[0.9em] text-slate-500"
          variants={blurReveal}
          initial="hidden"
          animate={animate}
          custom={SEGMENT_DELAY_S * 2}
        >
          Je construis des produits pensés pour les{" "}
          <motion.span
            className="glow-pulse bg-linear-to-r from-slate-300 to-cyan-300 bg-clip-text text-[1.15em] text-transparent"
            variants={keywordPunch}
            initial="hidden"
            animate={animate}
            custom={SEGMENT_DELAY_S * 2}
          >
            utilisateurs
          </motion.span>
          .
        </motion.span>
      </p>
    </div>
  );
}

function ReplayButton({ onReplay }: { onReplay: () => void }) {
  return (
    <button
      onClick={onReplay}
      className="mt-4 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-400 transition-colors hover:border-slate-600 hover:text-slate-300"
    >
      Rejouer l&apos;animation
    </button>
  );
}

export default function TaglineStylingDemo() {
  const [key, setKey] = useState(0);

  return (
    <DemoSection
      number={5}
      title="Tagline Blur Reveal"
      description="Animation segmentée: 3 blur-reveals en séquence, les mots-clés 'punch' à l'apparition, glow activé après reveal."
    >
      <div className={cardClass}>
        <div className="mb-3">
          <span className="text-xs font-medium text-slate-300">
            Segmented Blur Reveal + Keyword Punch
          </span>
          <span className="ml-2 text-xs text-slate-500">
            blur(8px)→0 + y:12→0 + opacity:0→1, puis scale punch sur les keywords
          </span>
        </div>

        <div key={key}>
          <AnimatedTagline />
        </div>

        <ReplayButton onReplay={() => setKey((k) => k + 1)} />
      </div>
    </DemoSection>
  );
}
