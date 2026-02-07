import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ReactLenis } from "lenis/react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Projects from "./components/Projects";
import Skills from "./components/Skills";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Playground from "./components/playground/Playground";
import CursorTrail from "./components/effects/CursorTrail";
import { GRADIENT, NOISE_SVG } from "./constants/visual-effects";
import { REDUCED_MOTION } from "./constants/accessibility";
const isPlayground = new URLSearchParams(window.location.search).has("playground");
const lenisOptions = {
  duration: 1.2,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
};

export default function App() {
  const { i18n } = useTranslation();

  // Sync <html lang=""> and persist language choice
  useEffect(() => {
    if (!isPlayground) {
      document.documentElement.lang = i18n.language;
      localStorage.setItem("lng", i18n.language);
    }
  }, [i18n.language]);

  if (isPlayground) return <Playground />;

  const content = (
      <div className="relative min-h-screen overflow-x-hidden bg-slate-950 text-slate-100">
      <CursorTrail />

      {/* Ambient background glow — static radial gradients (no blur filters) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-screen">
        <div
          className="absolute left-1/4 top-[12%] h-[600px] w-[600px] rounded-full"
          style={{ background: GRADIENT.ambientCyan }}
        />
        <div
          className="absolute right-1/4 top-[35%] h-[500px] w-[500px] rounded-full"
          style={{ background: GRADIENT.ambientBlue }}
        />
        <div
          className="absolute left-1/2 top-1/4 h-[400px] w-[400px] -translate-x-1/2 rounded-full"
          style={{ background: GRADIENT.ambientTeal }}
        />
      </div>

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

  if (REDUCED_MOTION) return content;

  return (
    <ReactLenis root options={lenisOptions}>
      {content}
    </ReactLenis>
  );
}
