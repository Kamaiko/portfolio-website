import { Trans, useTranslation } from "react-i18next";
import Section from "./Section";
import ScrollReveal from "./ScrollReveal";
import CityScene from "./CityScene";
import { stackItems, interests, journeySteps } from "../data/about";

const STAGGER_MS = 0.1;

const cardClass =
  "rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-all duration-300 hover:border-cyan-400/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.05)] hover:scale-[1.01]";

/** Inline highlight used inside <Trans> for cyan-accented keywords */
function Highlight({ children }: { children?: React.ReactNode }) {
  return (
    <span className="text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.4)]">
      {children}
    </span>
  );
}

export default function About() {
  const { t } = useTranslation();

  return (
    <Section id="about" title={t("about.title")}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* ── Tagline card — 2 cols ── */}
        <ScrollReveal
          delay={0 * STAGGER_MS}
          className={`${cardClass} flex items-center md:col-span-2`}
        >
          <p className="text-xl leading-relaxed text-slate-300 md:text-2xl">
            <Trans i18nKey="about.tagline" components={{ hl: <Highlight /> }} />
          </p>
        </ScrollReveal>

        {/* ── Journey card — 1 col ── */}
        <ScrollReveal delay={1 * STAGGER_MS} className={cardClass}>
          <h3 className="mb-4 text-sm font-semibold tracking-widest text-cyan-400 uppercase">
            {t("about.journey_title")}
          </h3>
          <div className="flex flex-col gap-3">
            {journeySteps.map(({ key, icon: Icon }, i) => (
              <div key={key} className="flex items-center gap-3">
                {/* Dot + connector line */}
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      i === journeySteps.length - 1
                        ? "bg-cyan-400/20 text-cyan-400"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    <Icon size={14} />
                  </div>
                </div>
                <span
                  className={`text-sm ${
                    i === journeySteps.length - 1
                      ? "font-semibold text-cyan-400"
                      : "text-slate-300"
                  }`}
                >
                  {t(`about.journey.${key}`)}
                </span>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* ── Stack card ── */}
        <ScrollReveal delay={2 * STAGGER_MS} className={cardClass}>
          <h3 className="mb-4 text-sm font-semibold tracking-widest text-cyan-400 uppercase">
            {t("about.stack_title")}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {stackItems.map((tech) => (
              <span
                key={tech.name}
                className="flex items-center gap-1.5 text-xs text-slate-300"
              >
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${tech.color}`}
                />
                {tech.name}
              </span>
            ))}
          </div>
        </ScrollReveal>

        {/* ── Interests card ── */}
        <ScrollReveal delay={3 * STAGGER_MS} className={cardClass}>
          <h3 className="mb-4 text-sm font-semibold tracking-widest text-cyan-400 uppercase">
            {t("about.interests_title")}
          </h3>
          <div className="flex flex-col gap-4">
            {interests.map(({ key, icon: Icon }) => (
              <div key={key} className="flex items-start gap-3">
                <Icon size={18} className="mt-0.5 shrink-0 text-slate-400" />
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    {t(`about.interests.${key}`)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t(`about.interests.${key}_fact`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* ── Fun snippet card ── */}
        <ScrollReveal delay={4 * STAGGER_MS} className={cardClass}>
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
        </ScrollReveal>

        {/* ── Pixel landscape — decorative closing card ── */}
        <ScrollReveal
          delay={5 * STAGGER_MS}
          className={`${cardClass} md:col-span-3 overflow-hidden p-0`}
        >
          <CityScene className="h-28 w-full md:h-40" />
        </ScrollReveal>
      </div>
    </Section>
  );
}
