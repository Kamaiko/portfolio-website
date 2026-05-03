import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import ScreenshotFan from "./ScreenshotFan";

const SCREENSHOTS = ["/img/1.webp", "/img/2.webp", "/img/3.webp"];

describe("ScreenshotFan", () => {
  it("renders 3 phone frames", () => {
    const { container } = render(<ScreenshotFan screenshots={SCREENSHOTS} projectName="Test" />);
    const images = container.querySelectorAll("img");
    expect(images).toHaveLength(3);
  });

  it("renders nothing when screenshots count is not 3", () => {
    const { container } = render(
      <ScreenshotFan screenshots={["/img/only.webp"]} projectName="Test" />,
    );
    expect(container.querySelectorAll("img")).toHaveLength(0);
  });

  it("applies position-specific classes (left, center, right)", () => {
    const { container } = render(<ScreenshotFan screenshots={SCREENSHOTS} projectName="Test" />);
    expect(container.querySelector(".screenshot-fan__phone--left")).toBeTruthy();
    expect(container.querySelector(".screenshot-fan__phone--center")).toBeTruthy();
    expect(container.querySelector(".screenshot-fan__phone--right")).toBeTruthy();
  });

  it("renders fade overlays only on side phones", () => {
    const { container } = render(<ScreenshotFan screenshots={SCREENSHOTS} projectName="Test" />);
    expect(container.querySelectorAll(".screenshot-fan__fade")).toHaveLength(2);
  });
});
