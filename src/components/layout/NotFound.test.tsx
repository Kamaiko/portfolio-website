import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock Three.js for NotFound3D lazy import
vi.mock("three", () => {
  const noop = () => {};
  const MockObj = class {
    set() {
      return this;
    }
    dispose = noop;
  };
  return {
    Euler: MockObj,
    Matrix4: MockObj,
    Vector3: MockObj,
    Color: MockObj,
    CanvasTexture: class {
      dispose = noop;
    },
    AdditiveBlending: 1,
  };
});
vi.mock("@react-three/fiber", () => ({ Canvas: () => null }));
vi.mock("@react-three/drei", () => ({
  Text3D: () => null,
  Center: ({ children }: { children: React.ReactNode }) => children,
  Float: ({ children }: { children: React.ReactNode }) => children,
  Environment: () => null,
  ContactShadows: () => null,
  Sparkles: () => null,
}));

let mockReducedMotion = false;
vi.mock("../../constants/accessibility", () => ({
  get REDUCED_MOTION() {
    return mockReducedMotion;
  },
}));

let mockIsMobile = false;
vi.mock("../../hooks/useIsMobile", () => ({
  useIsMobile: () => mockIsMobile,
}));

import NotFound from "./NotFound";

describe("NotFound", () => {
  beforeEach(() => {
    mockReducedMotion = false;
    mockIsMobile = false;
  });

  it("renders the back link and message", () => {
    render(<NotFound />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/");
  });

  it("shows flat 404 when reduced motion is enabled", () => {
    mockReducedMotion = true;
    const { container } = render(<NotFound />);
    expect(container.querySelector("h1")).toHaveTextContent("404");
  });

  it("renders 3D scene container when reduced motion is disabled", () => {
    mockReducedMotion = false;
    const { container } = render(<NotFound />);
    // The 3D scene is wrapped in Suspense inside an ErrorBoundary
    // The opacity transition container should exist
    const transitionDiv = container.querySelector(".transition-opacity");
    expect(transitionDiv).toBeInTheDocument();
  });
});
