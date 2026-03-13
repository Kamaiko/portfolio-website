import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, act } from "@testing-library/react";

// Override matchMedia BEFORE module evaluation so HAS_FINE_POINTER = true
vi.hoisted(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: query === "(pointer: fine)",
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
});

let mockIsMobile = false;
vi.mock("../../hooks/useIsMobile", () => ({
  useIsMobile: () => mockIsMobile,
}));

let mockReducedMotion = false;
vi.mock("../../constants/accessibility", () => ({
  get REDUCED_MOTION() {
    return mockReducedMotion;
  },
}));

import CursorTrail from "./CursorTrail";

describe("CursorTrail", () => {
  beforeEach(() => {
    mockIsMobile = false;
    mockReducedMotion = false;
  });

  it("returns null on mobile", () => {
    mockIsMobile = true;

    const { container } = render(<CursorTrail />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null when reduced motion is enabled", () => {
    mockReducedMotion = true;

    const { container } = render(<CursorTrail />);
    expect(container.firstChild).toBeNull();
  });

  it("renders cursor elements when all conditions pass", () => {
    const { container } = render(<CursorTrail />);

    // Should render ring (motion.div) + dot (div)
    const elements = container.querySelectorAll(".pointer-events-none");
    expect(elements.length).toBe(2);
  });

  it("updates dot position on mousemove", () => {
    // Polyfill elementFromPoint for jsdom
    const originalEFP = document.elementFromPoint;
    document.elementFromPoint = () => null;

    const { container } = render(<CursorTrail />);
    const dot = container.querySelectorAll(".pointer-events-none")[1] as HTMLElement;

    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 100, clientY: 200 }));
    });

    expect(dot.style.translate).toBe("97px 197px");
    document.elementFromPoint = originalEFP;
  });

  it("hides elements on mouseleave and restores on mouseenter", () => {
    const originalEFP = document.elementFromPoint;
    document.elementFromPoint = () => null;

    const { container } = render(<CursorTrail />);
    const dot = container.querySelectorAll(".pointer-events-none")[1] as HTMLElement;
    const ring = container.querySelectorAll(".pointer-events-none")[0] as HTMLElement;

    act(() => {
      document.documentElement.dispatchEvent(new MouseEvent("mouseleave"));
    });

    expect(dot.style.opacity).toBe("0");
    expect(ring.style.opacity).toBe("0");

    act(() => {
      document.documentElement.dispatchEvent(new MouseEvent("mouseenter"));
    });

    expect(dot.style.opacity).toBe("1");
    expect(ring.style.opacity).toBe("1");
    document.elementFromPoint = originalEFP;
  });

  it("restores visibility on mousemove after mouseleave", () => {
    const originalEFP = document.elementFromPoint;
    document.elementFromPoint = () => null;

    const { container } = render(<CursorTrail />);
    const dot = container.querySelectorAll(".pointer-events-none")[1] as HTMLElement;
    const ring = container.querySelectorAll(".pointer-events-none")[0] as HTMLElement;

    // Leave first
    act(() => {
      document.documentElement.dispatchEvent(new MouseEvent("mouseleave"));
    });
    expect(dot.style.opacity).toBe("0");

    // Move mouse — should restore visibility
    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 50, clientY: 50 }));
    });

    expect(dot.style.opacity).toBe("1");
    expect(ring.style.opacity).toBe("1");
    document.elementFromPoint = originalEFP;
  });

  it("detects hover on clickable elements", () => {
    // Create a clickable element in the document
    const button = document.createElement("button");
    document.body.appendChild(button);

    // Mock elementFromPoint to return the button
    const originalEFP = document.elementFromPoint;
    document.elementFromPoint = () => button;

    // Need enough time gap for throttle (HOVER_CHECK_INTERVAL_MS = 100)
    vi.spyOn(performance, "now").mockReturnValue(200);

    const { container } = render(<CursorTrail />);
    const dot = container.querySelectorAll(".pointer-events-none")[1] as HTMLElement;

    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 50, clientY: 50 }));
    });

    expect(dot.style.scale).toBe("2.5");
    expect(dot.style.opacity).toBe("0.6");

    // Move away from clickable — mock returns non-clickable
    document.elementFromPoint = () => document.body;
    vi.spyOn(performance, "now").mockReturnValue(400);

    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 60, clientY: 60 }));
    });

    expect(dot.style.scale).toBe("1");
    expect(dot.style.opacity).toBe("1");

    // Restore
    document.elementFromPoint = originalEFP;
    document.body.removeChild(button);
    vi.restoreAllMocks();
  });
});
