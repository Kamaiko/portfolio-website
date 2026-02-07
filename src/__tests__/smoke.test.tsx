import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import i18n from "../i18n";
import { useIsMobile } from "../hooks/useIsMobile";

// Mock Three.js — jsdom has no WebGL
vi.mock("three", () => ({}));
vi.mock("@react-three/fiber", () => ({ Canvas: () => null }));

describe("Smoke tests", () => {
  it("i18n defaults to French", () => {
    expect(i18n.language).toBe("fr");
  });

  it("useIsMobile returns a boolean", () => {
    const { result } = renderHook(() => useIsMobile());
    expect(typeof result.current).toBe("boolean");
  });

  it("App renders without crashing", async () => {
    // Lazy imports (HeroParticles, Playground) are mocked via Three.js mock above
    const { default: App } = await import("../App");
    render(<App />);
    // Hero greeting should be visible
    expect(screen.getByText(i18n.t("hero.greeting"))).toBeInTheDocument();
  });
});
