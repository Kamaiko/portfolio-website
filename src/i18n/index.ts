import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import fr from "./fr.json";
import en from "./en.json";

const savedLng = typeof window !== "undefined" ? localStorage.getItem("lng") : null;

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
  },
  lng: savedLng || "fr",
  fallbackLng: "fr",
  interpolation: { escapeValue: false },
});

export default i18n;
