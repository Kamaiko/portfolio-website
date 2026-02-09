import { useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { motion, useInView, useReducedMotion, type Variant } from "framer-motion";
import Section from "../layout/Section";
import ScrollReveal from "../ui/ScrollReveal";
import SpotlightCard from "../ui/SpotlightCard";
import CityScene from "../ui/CityScene";
import { stackItems, interests, journeySteps, SNIPPET_LINES, SNIPPET_CHAR_DELAY_MS } from "../../data/about";
import { CARD_BASE, CARD_SHADOW_LIGHT } from "../../constants/styles";
import { INVIEW_MARGIN } from "../../constants/layout";
import { cn } from "../../utils/cn";

const STAGGER_MS = 0.1;

const cardClass = cn(CARD_BASE, CARD_SHADOW_LIGHT, "p-6");

const stackContainerVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { delayChildren: 0.5, staggerChildren: 0.08, when: "beforeChildren" as const },
  },
};

const stackItemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 150, damping: 18 },
  },
};

/** Hover micro-animations for each interest icon (keyed by i18n key) */
const INTEREST_HOVER: Record<string, Variant> = {
  fitness: { y: [-4, 0, -2, 0], transition: { duration: 0.4 } },
  chess: { rotate: [0, -15, 5, 0], transition: { duration: 0.4 } },
  gaming: { x: [0, 3, -3, 2, -1, 0], transition: { duration: 0.4 } },
};

/** Inline highlight used inside <Trans> for cyan-accented keywords */
function Highlight({ children }: { children?: React.ReactNode }) {
  return (
    <span className="glow-pulse text-[1.15em] text-cyan-400">
      {children}
    </span>
  );
}

/** Muted second-line wrapper used inside <Trans> for the tagline subtitle */
function Subtitle({ children }: { children?: React.ReactNode }) {
  return (
    <span className="mt-1 block text-[0.9em] text-slate-500">
      {children}
    </span>
  );
}

/** Soft cyan accent for key words on the subtitle line (static glow, no animation) */
function Accent({ children }: { children?: React.ReactNode }) {
  return (
    <span className="text-[1.15em]">
      {children}
    </span>
  );
}

function StackCard({ title, delay }: { title: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: INVIEW_MARGIN });
  const skip = !!useReducedMotion();

  return (
    <ScrollReveal delay={delay}>
      <SpotlightCard className={cardClass}>
        <h3 className="mb-4 text-sm font-semibold tracking-widest text-cyan-400 uppercase">
          {title}
        </h3>
        <motion.div
          ref={ref}
          className="grid grid-cols-2 gap-2"
          variants={skip ? undefined : stackContainerVariants}
          initial={skip ? undefined : "hidden"}
          animate={skip ? undefined : isInView ? "visible" : "hidden"}
        >
          {stackItems.map((tech) => (
            <motion.span
              key={tech.name}
              className="flex items-center gap-1.5 text-xs text-slate-300"
              variants={skip ? undefined : stackItemVariants}
            >
              <span
                className={cn("h-1.5 w-1.5 shrink-0 rounded-full", tech.color)}
              />
              {tech.name}
            </motion.span>
          ))}
        </motion.div>
      </SpotlightCard>
    </ScrollReveal>
  );
}

function SnippetCard({ delay }: { delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: INVIEW_MARGIN });
  const skip = !!useReducedMotion();

  // Flatten tokens into individual characters
  const allChars: { char: string; color: string }[] = [];
  SNIPPET_LINES.forEach((line, lineIdx) => {
    line.forEach((token) => {
      for (const char of token.text) {
        allChars.push({ char, color: token.color });
      }
    });
    if (lineIdx < SNIPPET_LINES.length - 1) {
      allChars.push({ char: "\n", color: "" });
    }
  });

  const totalChars = allChars.length;
  const [charIndex, setCharIndex] = useState(skip ? totalChars : 0);

  useEffect(() => {
    if (!isInView || skip) return;
    if (charIndex >= totalChars) return;
    const timer = setTimeout(
      () => setCharIndex((prev) => prev + 1),
      SNIPPET_CHAR_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [isInView, skip, charIndex, totalChars]);

  const isDone = charIndex >= totalChars;

  return (
    <ScrollReveal delay={delay}>
      <SpotlightCard className={cardClass}>
        <div ref={ref} className="flex h-full items-center justify-center">
          <pre className="font-mono text-sm leading-relaxed">
            <code>
              {allChars.map((c, i) =>
                c.char === "\n" ? (
                  <br key={i} />
                ) : i === charIndex && !skip ? (
                  <span key={i}>
                    <span
                      className="ml-px inline-block h-[1.1em] w-[2px] bg-cyan-400 align-text-bottom animate-pulse"
                    />
                    <span className={cn(c.color, "invisible")}>{c.char}</span>
                  </span>
                ) : (
                  <span key={i} className={cn(c.color, i >= charIndex && !skip && "invisible")}>
                    {c.char}
                  </span>
                ),
              )}
              {isDone && !skip && (
                <span
                  className="ml-px inline-block h-[1.1em] w-[2px] bg-cyan-400 align-text-bottom animate-pulse"
                />
              )}
            </code>
          </pre>
        </div>
      </SpotlightCard>
    </ScrollReveal>
  );
}

export default function About() {
  const { t } = useTranslation();
  const skip = !!useReducedMotion();
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const taglineInView = useInView(taglineRef, { once: true, margin: INVIEW_MARGIN });

  return (
    <Section id="about" title={t("about.title")}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* ── Tagline card — 2 cols ── */}
        <ScrollReveal delay={0} className="md:col-span-2">
          <SpotlightCard className={cn(cardClass, "flex items-center")}>
            <p
              ref={taglineRef}
              className={cn(
                "tagline-glow text-xl leading-relaxed text-slate-300 md:text-2xl",
                taglineInView && "glow-active",
              )}
            >
              <Trans i18nKey="about.tagline" components={{ hl: <Highlight />, br: <br />, sub: <Subtitle />, accent: <Accent /> }} />
            </p>
          </SpotlightCard>
        </ScrollReveal>

        {/* ── Journey card — 1 col ── */}
        <ScrollReveal delay={1 * STAGGER_MS}>
          <SpotlightCard className={cardClass}>
            <h3 className="mb-4 text-sm font-semibold tracking-widest text-cyan-400 uppercase">
              {t("about.journey_title")}
            </h3>
            <div className="flex flex-col gap-3">
              {journeySteps.map((step) => {
                const { key, icon: Icon } = step;
                const isCurrent = "current" in step && step.current;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                        isCurrent
                          ? "bg-cyan-400/20 text-cyan-400"
                          : "bg-slate-800 text-slate-400",
                      )}
                    >
                      <Icon size={14} />
                    </div>
                    <div>
                      <p
                        className={cn(
                          "text-sm",
                          isCurrent
                            ? "font-semibold text-cyan-400"
                            : "text-slate-300",
                        )}
                      >
                        {t(`about.journey.${key}`)}
                      </p>
                      <p className="text-xs text-slate-500">{t(`about.journey.${key}_years`)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </SpotlightCard>
        </ScrollReveal>

        {/* ── Stack card ── */}
        <StackCard title={t("about.stack_title")} delay={2 * STAGGER_MS} />

        {/* ── Interests card ── */}
        <ScrollReveal delay={3 * STAGGER_MS}>
          <SpotlightCard className={cardClass}>
            <h3 className="mb-4 text-sm font-semibold tracking-widest text-cyan-400 uppercase">
              {t("about.interests_title")}
            </h3>
            <div className="flex flex-col gap-4">
              {interests.map(({ key, icon: Icon }) => (
                <motion.div
                  key={key}
                  className="flex items-start gap-3 cursor-default"
                  whileHover={skip ? undefined : "hover"}
                >
                  <motion.div
                    variants={skip ? undefined : { hover: INTEREST_HOVER[key] }}
                    animate={{ rotate: 0, y: 0, x: 0 }}
                    className="mt-0.5 shrink-0 text-slate-400"
                  >
                    <Icon size={18} />
                  </motion.div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      {t(`about.interests.${key}`)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t(`about.interests.${key}_fact`)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </SpotlightCard>
        </ScrollReveal>

        {/* ── Code snippet card ── */}
        <SnippetCard delay={4 * STAGGER_MS} />

        {/* ── Pixel landscape — decorative closing card ── */}
        <ScrollReveal
          delay={5 * STAGGER_MS}
          className={cn(cardClass, "md:col-span-3 overflow-hidden p-0")}
        >
          <CityScene className="h-28 w-full md:h-40" />
        </ScrollReveal>
      </div>
    </Section>
  );
}
