import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Dumbbell, Swords, Gamepad2 } from "lucide-react";
import Section from "./Section";

const stackItems = [
  { name: "React", color: "bg-cyan-400" },
  { name: "React Native", color: "bg-cyan-400" },
  { name: "TypeScript", color: "bg-blue-500" },
  { name: "Tailwind CSS", color: "bg-sky-400" },
  { name: "Expo", color: "bg-slate-300" },
  { name: "Supabase", color: "bg-emerald-500" },
];

const interests = [
  { key: "fitness", icon: Dumbbell },
  { key: "chess", icon: Swords },
  { key: "gaming", icon: Gamepad2 },
] as const;

const cardClass =
  "rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition-all duration-300 hover:border-cyan-400/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.05)] hover:scale-[1.01]";

export default function About() {
  const { t } = useTranslation();

  return (
    <Section id="about" title={t("about.title")}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Bio card — spans 2 columns and 2 rows on desktop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`${cardClass} flex flex-col justify-center md:col-span-2 md:row-span-2`}
        >
          <p className="text-lg leading-relaxed text-slate-300">
            {t("about.bio")}
          </p>
        </motion.div>

        {/* Stack card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={cardClass}
        >
          <h3 className="mb-4 text-sm font-semibold tracking-widest text-cyan-400 uppercase">
            {t("about.stack_title")}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {stackItems.map((tech) => (
              <span
                key={tech.name}
                className="flex items-center gap-1.5 text-xs text-slate-300"
              >
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${tech.color}`} />
                {tech.name}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Interests card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={cardClass}
        >
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
        </motion.div>
      </div>
    </Section>
  );
}
