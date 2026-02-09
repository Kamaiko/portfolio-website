import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, act } from "@testing-library/react";
import { REVEAL_DURATION_S, REVEAL_CLEANUP_MS } from "../../constants/animation";

// Module-scope mock state — reset in beforeEach
let mockInView = false;
let mockReducedMotion = false;

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  return {
    ...actual,
    useInView: () => mockInView,
    useReducedMotion: () => mockReducedMotion,
  };
});

import ScrollReveal from "./ScrollReveal";

describe("ScrollReveal", () => {
  beforeEach(() => {
    mockInView = false;
    mockReducedMotion = false;
  });

  it("skips animation when reduced motion is enabled", () => {
    mockReducedMotion = true;

    const { container } = render(
      <ScrollReveal>
        <p>Content</p>
      </ScrollReveal>,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ opacity: "1" });
    expect(wrapper.style.transform).toBe("");
  });

  it("reveals when in view", () => {
    mockInView = true;

    const { container } = render(
      <ScrollReveal yOffset={60}>
        <p>Content</p>
      </ScrollReveal>,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ opacity: "1" });
    expect(wrapper.style.transform).toBe("");
  });

  it("hides when not in view", () => {
    const { container } = render(
      <ScrollReveal yOffset={60}>
        <p>Content</p>
      </ScrollReveal>,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ opacity: "0" });
    expect(wrapper.style.transform).toBe("translateY(60px)");
  });

  it("removes transition after cleanup timer", () => {
    vi.useFakeTimers();
    mockInView = true;
    const delay = 0.5;

    const { container } = render(
      <ScrollReveal delay={delay}>
        <p>Content</p>
      </ScrollReveal>,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.transition).toContain("opacity");

    // Advance past cleanup timer: (delay + REVEAL_DURATION_S) * 1000 + REVEAL_CLEANUP_MS
    const totalMs = (delay + REVEAL_DURATION_S) * 1000 + REVEAL_CLEANUP_MS;
    act(() => {
      vi.advanceTimersByTime(totalMs + 1);
    });

    expect(wrapper.style.transition).toBe("");

    vi.useRealTimers();
  });
});
