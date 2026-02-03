import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Mail, FileDown, Github, Linkedin, Instagram } from "lucide-react";
import Section from "./Section";
import { useIsMobile } from "../hooks/useIsMobile";

export default function Contact() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  return (
    <Section id="contact" title={t("contact.title")}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: isMobile ? "-50px" : "-100px" }}
        transition={{ duration: 0.5, delay: isMobile ? 0 : 0.1 }}
        className="max-w-lg rounded-2xl border border-slate-800 bg-slate-900/50 p-8"
      >
        <p className="mb-8 text-slate-300">{t("contact.text")}</p>

        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
          <a
            href="mailto:contact@halterofit.ca"
            className="flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-3 font-medium text-slate-950 transition-colors hover:bg-cyan-400"
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
            aria-label="GitHub"
            className="text-slate-500 transition-colors hover:text-white"
          >
            <Github size={22} />
          </a>
          <a
            href="https://www.linkedin.com/in/patrickpatenaude/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-slate-500 transition-colors hover:text-white"
          >
            <Linkedin size={22} />
          </a>
          <a
            href="https://www.instagram.com/patrickpatenaude/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-slate-500 transition-colors hover:text-white"
          >
            <Instagram size={22} />
          </a>
        </div>
      </motion.div>
    </Section>
  );
}
