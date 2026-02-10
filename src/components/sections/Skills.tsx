import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useInView } from "framer-motion";
import Section from "../layout/Section";
import ScrollReveal from "../ui/ScrollReveal";
import { row1Skills, row2Skills } from "../../data/skills";
import { cn } from "../../utils/cn";

// ── Marquee timing ──
const MARQUEE_DEFAULT_DURATION_S = 30;
const MARQUEE_ROW1_DURATION_S = 35;
const MARQUEE_ROW2_DURATION_S = 40;
const MARQUEE_INVIEW_MARGIN = "200px";

// ── Class strings ──
const FADE_EDGE_BASE =
  "pointer-events-none absolute top-0 z-10 h-full w-32 md:w-48";
const SKILL_BADGE_CLASS =
  "inline-flex items-center whitespace-nowrap rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-300";

interface MarqueeRowProps {
  skills: readonly string[];
  reverse?: boolean;
  duration?: number;
}

function MarqueeRow({
  skills,
  reverse = false,
  duration = MARQUEE_DEFAULT_DURATION_S,
}: MarqueeRowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { margin: MARQUEE_INVIEW_MARGIN });
  const doubled = [...skills, ...skills];

  return (
    <div ref={ref} className="group relative overflow-hidden py-2">
      {/* Fade edges */}
      <div className={cn(FADE_EDGE_BASE, "left-0 bg-linear-to-r from-slate-950 to-transparent")} />
      <div className={cn(FADE_EDGE_BASE, "right-0 bg-linear-to-l from-slate-950 to-transparent")} />

      <div
        className="marquee-track flex w-max gap-4 group-hover:[animation-play-state:paused]"
        style={{
          animation: `${reverse ? "marquee-right" : "marquee-left"} ${duration}s linear infinite`,
          animationPlayState: isInView ? "running" : "paused",
        }}
      >
        {doubled.map((skill, i) => (
          <span
            key={`${skill}-${i}`}
            className={SKILL_BADGE_CLASS}
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Skills() {
  const { t } = useTranslation();

  return (
    <Section id="skills" title={t("skills.title")}>
      <div className="flex min-h-[20vh] w-full items-center">
        <ScrollReveal className="w-full">
          <div className="flex flex-col gap-4">
            <MarqueeRow skills={row1Skills} duration={MARQUEE_ROW1_DURATION_S} />
            <MarqueeRow skills={row2Skills} reverse duration={MARQUEE_ROW2_DURATION_S} />
          </div>
        </ScrollReveal>
      </div>
    </Section>
  );
}
