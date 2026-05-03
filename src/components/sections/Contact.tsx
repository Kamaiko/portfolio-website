import { useTranslation } from "react-i18next";
import Mail from "lucide-react/dist/esm/icons/mail";
import FileDown from "lucide-react/dist/esm/icons/file-down";
import Section from "../layout/Section";
import ScrollReveal from "../ui/ScrollReveal";
import SpotlightCard from "../ui/SpotlightCard";
import { socialLinks, CONTACT_EMAIL, CV_PATH } from "../../data/contact";
import { CARD_BASE, CARD_SHADOW_LIGHT } from "../../constants/styles";
import { cn } from "../../utils/cn";

const BUTTON_BASE = "flex items-center gap-2 rounded-lg px-5 py-3 font-medium transition-colors";
const BUTTON_ICON_PX = 18;
const SOCIAL_ICON_PX = 22;

export default function Contact() {
  const { t } = useTranslation();

  return (
    <Section id="contact" title={t("contact.title")}>
      <ScrollReveal className="max-w-lg">
        <SpotlightCard className={cn(CARD_BASE, CARD_SHADOW_LIGHT, "p-8")}>
          <p className="mb-8 text-slate-300">{t("contact.text")}</p>

          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className={cn(BUTTON_BASE, "bg-cyan-500 text-slate-950 hover:bg-cyan-400")}
            >
              <Mail size={BUTTON_ICON_PX} />
              {t("contact.email_btn")}
            </a>
            <a
              href={CV_PATH}
              download
              className={cn(
                BUTTON_BASE,
                "border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white",
              )}
            >
              <FileDown size={BUTTON_ICON_PX} />
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
                <Icon size={SOCIAL_ICON_PX} />
              </a>
            ))}
          </div>
        </SpotlightCard>
      </ScrollReveal>
    </Section>
  );
}
