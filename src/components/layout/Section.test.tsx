import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

let mockReducedMotion = false;
vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  return {
    ...actual,
    useReducedMotion: () => mockReducedMotion,
  };
});

import Section from "./Section";

describe("Section", () => {
  it("renders with parallax (default)", () => {
    mockReducedMotion = false;
    render(
      <Section id="test" title="Test Title">
        <p>Content</p>
      </Section>,
    );
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders without parallax when reduced motion", () => {
    mockReducedMotion = true;
    render(
      <Section id="test2" title="Static Title">
        <p>Static content</p>
      </Section>,
    );
    expect(screen.getByText("Static Title")).toBeInTheDocument();
  });
});
