import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import Section from "./Section";

export default function About() {
  const { t } = useTranslation();

  return (
    <Section id="about" title={t("about.title")}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="max-w-2xl space-y-4 text-slate-300 leading-relaxed"
      >
        <p>{t("about.p1")}</p>
        <p>{t("about.p2")}</p>
      </motion.div>
    </Section>
  );
}
