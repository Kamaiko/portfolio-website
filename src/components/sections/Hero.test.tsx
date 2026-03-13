import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock Three.js — no WebGL in jsdom
vi.mock("three", () => {
  const noop = () => {};
  const MockObj = class {
    r = 0;
    g = 0;
    b = 0;
    set() {
      return this;
    }
    applyMatrix4() {
      return this;
    }
    makeRotationFromEuler() {
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

let mockReducedMotion = false;
vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  return {
    ...actual,
    useReducedMotion: () => mockReducedMotion,
  };
});

vi.mock("lenis/react", () => ({
  useLenis: () => null,
}));

import Hero from "./Hero";

describe("Hero", () => {
  it("renders with reduced motion (skip = true)", () => {
    mockReducedMotion = true;
    render(<Hero />);
    // Scroll indicator button should be present
    expect(screen.getByRole("button", { name: /scroll/i })).toBeInTheDocument();
  });

  it("renders with animations (skip = false)", () => {
    mockReducedMotion = false;
    render(<Hero />);
    expect(screen.getByRole("button", { name: /scroll/i })).toBeInTheDocument();
  });

  it("scrollToAbout scrolls to the about section", () => {
    mockReducedMotion = false;
    const scrollToSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    const aboutEl = document.createElement("div");
    aboutEl.id = "about";
    document.body.appendChild(aboutEl);

    render(<Hero />);
    fireEvent.click(screen.getByRole("button", { name: /scroll/i }));

    expect(scrollToSpy).toHaveBeenCalled();

    document.body.removeChild(aboutEl);
    scrollToSpy.mockRestore();
  });
});
