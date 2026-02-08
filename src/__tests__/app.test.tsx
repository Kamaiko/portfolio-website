import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import i18n from "../i18n";
import { useIsMobile } from "../hooks/useIsMobile";

// Mock Three.js — jsdom has no WebGL.
// HeroParticles creates THREE.Euler/Matrix4/Vector3 at module scope,
// so we must provide constructible stubs (not an empty object).
vi.mock("three", () => {
  const noop = () => {};
  const MockObj = class {
    r = 0; g = 0; b = 0;
    set() { return this; }
    applyMatrix4() { return this; }
    makeRotationFromEuler() { return this; }
    dispose = noop;
  };
  return {
    Euler: MockObj,
    Matrix4: MockObj,
    Vector3: MockObj,
    Color: MockObj,
    CanvasTexture: class { dispose = noop; },
    AdditiveBlending: 1,
  };
});
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
