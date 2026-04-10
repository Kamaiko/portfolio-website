import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ReactLenis } from "lenis/react";
import Navbar from "./components/layout/Navbar";
import Hero from "./components/sections/Hero";
import About from "./components/sections/About";
import Projects from "./components/sections/Projects";
import Skills from "./components/sections/Skills";
import Contact from "./components/sections/Contact";
import Footer from "./components/layout/Footer";
import CursorTrail from "./components/effects/CursorTrail";
import DotGridBackground from "./components/effects/DotGridBackground";
import NotFound from "./components/layout/NotFound";
import { NOISE_SVG } from "./constants/visual-effects";
import { REDUCED_MOTION } from "./constants/accessibility";
import { useIsMobile } from "./hooks/useIsMobile";
const isNotFound = window.location.pathname !== "/";
const lenisOptions = {
  duration: 1.2,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
};

export default function App() {
  const { i18n } = useTranslation();
  const isMobile = useIsMobile();

  // Sync <html lang=""> and persist language choice
  useEffect(() => {
    document.documentElement.lang = i18n.language;
    localStorage.setItem("lng", i18n.language);
  }, [i18n.language]);

  if (isNotFound) return <NotFound />;

  const content = (
    <div className="relative isolate min-h-screen overflow-x-clip bg-slate-950 text-slate-100">
      <CursorTrail />
      <DotGridBackground />

      {/* Noise texture — covers full page */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage: `url("${NOISE_SVG}")`,
          backgroundRepeat: "repeat",
          backgroundSize: "256px 256px",
        }}
      />

      <Navbar />
      <main>
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </div>
  );

  if (REDUCED_MOTION || isMobile) return content;

  return (
    <ReactLenis root options={lenisOptions}>
      {content}
    </ReactLenis>
  );
}
