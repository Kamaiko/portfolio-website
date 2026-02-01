import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Mail, FileDown, Github, Linkedin } from "lucide-react";
import Section from "./Section";

export default function Contact() {
  const { t } = useTranslation();

  return (
    <Section id="contact" title={t("contact.title")}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="max-w-md"
      >
        <p className="mb-8 text-slate-400">{t("contact.text")}</p>

        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
          <a
            href="mailto:contact@halterofit.ca"
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 font-medium text-slate-950 transition-colors hover:bg-emerald-400"
          >
            <Mail size={18} />
            {t("contact.email_btn")}
          </a>
          <a
            href="/cv-patrick-patenaude.pdf"
            download
            className="flex items-center gap-2 rounded-lg border border-slate-700 px-5 py-3 font-medium text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
          >
            <FileDown size={18} />
            {t("contact.cv_btn")}
          </a>
        </div>

        <div className="mt-8 flex gap-5">
          <a
            href="https://github.com/Kamaiko"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 transition-colors hover:text-white"
          >
            <Github size={22} />
          </a>
          <a
            href="https://www.linkedin.com/in/patrickpatenaude/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 transition-colors hover:text-white"
          >
            <Linkedin size={22} />
          </a>
        </div>
      </motion.div>
    </Section>
  );
}
