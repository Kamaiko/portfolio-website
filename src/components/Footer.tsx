import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 px-6 py-8">
      <div className="mx-auto max-w-5xl text-center text-sm text-slate-400">
        <p className="mb-1">{t("footer.made_with")}</p>
        <p>&copy; {year} Patrick Patenaude. {t("footer.rights")}</p>
      </div>
    </footer>
  );
}
