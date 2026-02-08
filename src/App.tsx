import { lazy, Suspense, useEffect } from "react";
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
import NotFound from "./components/layout/NotFound";

const Playground = lazy(() => import("./components/playground/Playground"));
import { GRADIENT, NOISE_SVG } from "./constants/visual-effects";
import { REDUCED_MOTION } from "./constants/accessibility";
const isPlayground = new URLSearchParams(window.location.search).has("playground");
const isNotFound = window.location.pathname !== "/";
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

  if (isPlayground) return <Suspense fallback={null}><Playground /></Suspense>;
  if (isNotFound) return <NotFound />;

  const content = (
      <div className="relative min-h-screen overflow-x-clip bg-slate-950 text-slate-100">
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
