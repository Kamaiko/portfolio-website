import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Menu, X, Globe } from "lucide-react";
import { useLenis } from "lenis/react";

const navLinks = ["about", "projects", "skills", "contact"] as const;
const NAV_HEIGHT = 72;

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const lenis = useLenis();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const onScroll = () => {
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.body.scrollHeight - 2;
      if (atBottom) {
        setActiveSection("contact");
        return;
      }

      let current = "";
      let closest = -Infinity;
      for (const id of navLinks) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top - NAV_HEIGHT;
        if (top <= 10 && top > closest) {
          closest = top;
          current = id;
        }
      }
      if (current) setActiveSection(current);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === "fr" ? "en" : "fr");
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      if (lenis) {
        lenis.scrollTo(el, { offset: -NAV_HEIGHT });
      } else {
        const top = el.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }
    setMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <button
          onClick={() => lenis ? lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Scroll to top"
          className="text-lg font-bold text-white"
        >
          PP
        </button>

        {/* Desktop */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <button
              key={link}
              onClick={() => scrollTo(link)}
              className={`text-sm transition-colors hover:text-white ${activeSection === link ? "text-cyan-400" : "text-slate-400"}`}
            >
              {t(`nav.${link}`)}
            </button>
          ))}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 rounded-full border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:border-slate-500 hover:text-white"
          >
            <Globe size={14} />
            {i18n.language === "fr" ? "EN" : "FR"}
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="text-slate-400 md:hidden"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-slate-800 bg-slate-950 px-6 py-4 md:hidden">
          {navLinks.map((link) => (
            <button
              key={link}
              onClick={() => scrollTo(link)}
              className={`block w-full py-3 text-left transition-colors hover:text-white ${activeSection === link ? "text-cyan-400" : "text-slate-400"}`}
            >
              {t(`nav.${link}`)}
            </button>
          ))}
          <button
            onClick={toggleLang}
            className="mt-2 flex items-center gap-1.5 text-sm text-slate-400"
          >
            <Globe size={14} />
            {i18n.language === "fr" ? "English" : "Français"}
          </button>
        </div>
      )}
    </nav>
  );
}
