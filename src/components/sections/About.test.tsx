import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

let mockReducedMotion = false;
vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  return {
    ...actual,
    useReducedMotion: () => mockReducedMotion,
    useInView: () => true,
  };
});

import About from "./About";

describe("About", () => {
  it("renders with reduced motion (skip typing effect)", () => {
    mockReducedMotion = true;
    render(<About />);
    expect(screen.getByText(/stack/i)).toBeInTheDocument();
  });
});
