import { useTranslation } from "react-i18next";
import Mail from "lucide-react/dist/esm/icons/mail";
import FileDown from "lucide-react/dist/esm/icons/file-down";
import Section from "../layout/Section";
import ScrollReveal from "../ui/ScrollReveal";
import { socialLinks, CONTACT_EMAIL, CV_PATH } from "../../data/contact";
import { cn } from "../../utils/cn";

const buttonBase = "flex items-center gap-2 rounded-lg px-5 py-3 font-medium transition-colors";

export default function Contact() {
  const { t } = useTranslation();

  return (
    <Section id="contact" title={t("contact.title")}>
      <ScrollReveal>
      <div className="max-w-lg rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
        <p className="mb-8 text-slate-300">{t("contact.text")}</p>

        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className={cn(buttonBase, "bg-cyan-500 text-slate-950 hover:bg-cyan-400")}
          >
            <Mail size={18} />
            {t("contact.email_btn")}
          </a>
          <a
            href={CV_PATH}
            download
            className={cn(buttonBase, "border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white")}
          >
            <FileDown size={18} />
            {t("contact.cv_btn")}
          </a>
        </div>

        <div className="mt-8 flex gap-5">
          {socialLinks.map(({ href, icon: Icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="text-slate-400 transition-colors hover:text-white"
            >
              <Icon size={22} />
            </a>
          ))}
        </div>
      </div>
      </ScrollReveal>
    </Section>
  );
}
