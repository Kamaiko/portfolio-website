import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

let mockIsMobile = false;
vi.mock("../../hooks/useIsMobile", () => ({
  useIsMobile: () => mockIsMobile,
}));

import ScreenshotFan from "./ScreenshotFan";

const SCREENSHOTS = ["/img/1.webp", "/img/2.webp", "/img/3.webp"];

describe("ScreenshotFan", () => {
  beforeEach(() => {
    mockIsMobile = false;
  });

  it("renders 3 phone frames on desktop", () => {
    const { container } = render(<ScreenshotFan screenshots={SCREENSHOTS} projectName="Test" />);
    const images = container.querySelectorAll("img");
    expect(images).toHaveLength(3);
  });

  it("renders with mobile layout", () => {
    mockIsMobile = true;
    const { container } = render(<ScreenshotFan screenshots={SCREENSHOTS} projectName="Test" />);
    const images = container.querySelectorAll("img");
    expect(images).toHaveLength(3);
  });
});
