import { useTranslation } from "react-i18next";
import Section from "../layout/Section";
import { row1Skills, row2Skills } from "../../data/skills";

interface MarqueeRowProps {
  skills: readonly string[];
  reverse?: boolean;
  duration?: number;
}

function MarqueeRow({
  skills,
  reverse = false,
  duration = 30,
}: MarqueeRowProps) {
  const doubled = [...skills, ...skills];

  return (
    <div className="group relative overflow-hidden py-2">
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-linear-to-r from-slate-950 to-transparent md:w-48" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-linear-to-l from-slate-950 to-transparent md:w-48" />

      <div
        className="marquee-track flex w-max gap-4 group-hover:[animation-play-state:paused]"
        style={{
          animation: `${reverse ? "marquee-right" : "marquee-left"} ${duration}s linear infinite`,
        }}
      >
        {doubled.map((skill, i) => (
          <span
            key={`${skill}-${i}`}
            className="inline-flex items-center whitespace-nowrap rounded-lg border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-sm text-slate-300"
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
    <Section id="skills" title={t("skills.title")} className="pb-40">
      <div className="flex flex-col gap-4">
        <MarqueeRow skills={row1Skills} duration={35} />
        <MarqueeRow skills={row2Skills} reverse duration={40} />
      </div>
    </Section>
  );
}
