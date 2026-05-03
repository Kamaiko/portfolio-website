import { cn } from "../../utils/cn";

interface ScreenshotFanProps {
  screenshots: string[];
  projectName: string;
}

const POSITIONS = ["left", "center", "right"] as const;
const FADE_DIRECTIONS = ["left", "none", "right"] as const;

/**
 * Renders 3 phones in a fan layout. All animation is pure CSS:
 * desktop spreads on :hover, mobile spreads via animation-timeline: view().
 * A single `--spread` (0→1) drives every transform, opacity, and scale.
 */
export default function ScreenshotFan({ screenshots, projectName }: ScreenshotFanProps) {
  if (screenshots.length !== 3) return null;

  return (
    <div className="screenshot-fan">
      <div className="screenshot-fan__glow" aria-hidden="true" />
      <div className="screenshot-fan__stage">
        {screenshots.map((src, i) => {
          const fade = FADE_DIRECTIONS[i];
          return (
            <div
              key={src}
              className={cn("screenshot-fan__phone", `screenshot-fan__phone--${POSITIONS[i]}`)}
            >
              <div className="screenshot-fan__shell" />
              <div className="screenshot-fan__screen">
                <img src={src} alt={`${projectName} – ${i + 1}`} loading="lazy" />
              </div>
              <div className="screenshot-fan__notch" />
              {fade !== "none" && (
                <div
                  className={cn("screenshot-fan__fade", `screenshot-fan__fade--${fade}`)}
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
