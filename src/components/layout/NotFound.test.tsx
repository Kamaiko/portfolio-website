import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NotFound from "./NotFound";

describe("NotFound", () => {
  it("renders the back link and message", () => {
    render(<NotFound />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/");
  });

  it("renders the 404 heading", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("404");
  });
});
