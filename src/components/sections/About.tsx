import { useRef } from "react";
import { Trans, useTranslation } from "react-i18next";
import { motion, useInView, useReducedMotion, type Variant } from "framer-motion";
import Section from "../layout/Section";
import ScrollReveal from "../ui/ScrollReveal";
import SpotlightCard from "../ui/SpotlightCard";
import CityScene from "../ui/CityScene";
import { stackItems, interests, journeySteps } from "../../data/about";
import { CARD_BASE, CARD_SHADOW_LIGHT } from "../../constants/styles";
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
    <span className="glow-pulse text-cyan-400">
      {children}
    </span>
  );
}

function StackCard({ title, delay }: { title: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
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

export default function About() {
  const { t } = useTranslation();
  const skip = !!useReducedMotion();
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const taglineInView = useInView(taglineRef, { once: true, margin: "-80px" });

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
              <Trans i18nKey="about.tagline" components={{ hl: <Highlight /> }} />
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
              {journeySteps.map(({ key, icon: Icon }, i) => (
                <div key={key} className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                        i === journeySteps.length - 1
                          ? "bg-cyan-400/20 text-cyan-400"
                          : "bg-slate-800 text-slate-400",
                      )}
                    >
                      <Icon size={14} />
                    </div>
                  </div>
                  <span
                    className={cn(
                      "text-sm",
                      i === journeySteps.length - 1
                        ? "font-semibold text-cyan-400"
                        : "text-slate-300",
                    )}
                  >
                    {t(`about.journey.${key}`)}
                  </span>
                </div>
              ))}
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

        {/* ── Fun snippet card ── */}
        <ScrollReveal delay={4 * STAGGER_MS}>
          <SpotlightCard className={cardClass}>
            <div className="flex h-full items-center justify-center">
              <code className="text-sm text-slate-400 font-mono">
                <span className="text-purple-400">while</span>
                <span className="text-slate-500">(</span>
                <span className="text-cyan-400">alive</span>
                <span className="text-slate-500">) {"{"}</span>
                {" "}
                <span className="text-emerald-400">code</span>
                <span className="text-slate-500">();</span>
                {" "}
                <span className="text-emerald-400">lift</span>
                <span className="text-slate-500">();</span>
                {" "}
                <span className="text-slate-500">{"}"}</span>
              </code>
            </div>
          </SpotlightCard>
        </ScrollReveal>

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
