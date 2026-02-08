# Claude Instructions — Halterofit Portfolio

> **Updated**: 2026-02-07

## Overview

Portfolio for Patrick Patenaude at **halterofit.ca**. Single-page React app, bilingual FR/EN, dark theme, deployed on Cloudflare Pages via `main` branch. Dev work on `dev`.

## Tech Stack

TypeScript 5.9 (strict) · React 19 · Vite 7 · Tailwind CSS 4 · Framer Motion 12 · react-i18next 16 · Three.js + R3F · Lenis (smooth scroll) · Lucide React (icons) · clsx (via `cn()`)

## Commands

```bash
npm run dev       # localhost:5173
npm run build     # tsc + vite build → dist/
npm run lint      # ESLint
npx vitest run    # Tests (jsdom)
```

## Project Structure

```
src/
├── App.tsx                          # Root — routing (playground, 404, main), Lenis wrapper
├── main.tsx                         # Entry point
├── index.css                        # Tailwind import + CSS keyframes + reduced-motion rules
├── utils/cn.ts                      # Re-exports clsx → use for ALL className logic
├── constants/
│   ├── accessibility.ts             # REDUCED_MOTION (static matchMedia check)
│   ├── layout.ts                    # NAV_HEIGHT, SECTION_PROXIMITY_PX, REVEAL_DURATION_S…
│   ├── styles.ts                    # CARD_BASE, CARD_SHADOW, CARD_SHADOW_LIGHT
│   └── visual-effects.ts            # GRADIENT.* (radial gradients) + NOISE_SVG
├── data/                            # ALL static data lives here (never inline in components)
│   ├── about.ts                     # stackItems, interests, journeySteps
│   ├── city-scene.ts                # Palette, dimensions (W, H), buildings, stars
│   ├── contact.ts                   # socialLinks[], CV_PATH
│   ├── projects.ts                  # Project[] + project data
│   └── skills.ts                    # row1Skills, row2Skills
├── hooks/useIsMobile.ts             # Reactive media query hook (reactive, SSR-safe)
├── types/lucide-react-icons.d.ts    # Module declarations for deep Lucide imports
├── i18n/
│   ├── index.ts                     # i18next config (default: FR, persisted to localStorage)
│   ├── fr.json                      # French translations
│   └── en.json                      # English — MUST mirror fr.json key structure
├── components/
│   ├── layout/                      # Page structure
│   │   ├── Navbar.tsx               # Fixed nav + scroll spy + FR/EN toggle
│   │   ├── Footer.tsx               # Copyright
│   │   ├── Section.tsx              # Reusable section wrapper (title parallax)
│   │   └── NotFound.tsx             # 404 page
│   ├── sections/                    # Full-page content sections
│   │   ├── Hero.tsx                 # Sticky pinned hero + blur recession + camera dive
│   │   ├── About.tsx                # Bento grid (tagline, journey, stack, interests, code, city)
│   │   ├── Projects.tsx             # Project card grid
│   │   ├── Skills.tsx               # Dual marquee rows (CSS animation)
│   │   └── Contact.tsx              # Email, CV, social links
│   ├── ui/                          # Reusable UI components
│   │   ├── ProjectCard.tsx          # Individual project card
│   │   ├── ScreenshotFan.tsx        # 3-image fan hover/scroll effect
│   │   ├── ScrollReveal.tsx         # IntersectionObserver fade-in
│   │   ├── ErrorBoundary.tsx        # Class component — wraps HeroParticles
│   │   └── CityScene.tsx            # Animated SVG city (pure CSS, 3 scroll layers)
│   ├── effects/                     # Visual effect layers
│   │   ├── CursorTrail.tsx          # Dual-element cursor (dot=direct DOM, ring=FM spring)
│   │   └── HeroParticles.tsx        # Three.js galaxy (2050 particles, lazy-loaded)
│   └── playground/                  # Dev-only demos (?playground=true), lazy-loaded
└── __tests__/
    ├── setup.ts                     # jsdom polyfills (matchMedia, IntersectionObserver, ResizeObserver)
    └── app.test.tsx                 # Smoke tests (i18n, useIsMobile, App render)
```

## Conventions (MUST follow)

### Naming
- **Components**: PascalCase files + exports (`Hero.tsx`, `CursorTrail.tsx`)
- **Constants**: SCREAMING_SNAKE (`NAV_HEIGHT`, `PARTICLE_COUNT`, `CARD_BASE`)
- **Hooks**: `use` prefix, camelCase (`useIsMobile`, `useRadialTexture`)
- **Data files**: camelCase arrays/objects (`stackItems`, `row1Skills`)
- **CSS classes**: kebab-case (Tailwind utilities)
- **i18n keys**: `section.key` pattern (`hero.title`, `about.journey.psych`)

### className
- **ALWAYS** use `cn()` from `src/utils/cn.ts` for conditional or concatenated classNames
- **NEVER** use template literals (`\`foo ${bar}\``) for className

### Data separation
- Components = rendering logic ONLY. No inline data arrays.
- Static data → `src/data/`. Shared tokens → `src/constants/`.

### Icons
- Import Lucide icons from deep ESM path (tree-shaking):
  ```tsx
  import Mail from "lucide-react/dist/esm/icons/mail";
  ```

### Internationalization
- ALL user-facing text in `fr.json` + `en.json`. No hardcoded strings.
- When adding text: add to BOTH files with matching keys.
- Use `<Trans>` for inline formatting: `<Trans i18nKey="..." components={{ hl: <Highlight /> }} />`

## Animation Architecture

### Layers
| Layer | Tech | File | Reduced-motion |
|---|---|---|---|
| CursorTrail | Direct DOM + FM spring | `effects/CursorTrail.tsx` | Returns `null` |
| HeroParticles | Three.js / R3F (lazy) | `effects/HeroParticles.tsx` | Returns `null` |
| ScrollReveal | Inline styles + IntersectionObserver | `ScrollReveal.tsx` | FM `useReducedMotion()` |
| CityScene | Pure CSS keyframes | `CityScene.tsx` + `index.css` | CSS `@media` rules |
| ScreenshotFan | FM variants + scroll | `ScreenshotFan.tsx` | FM `useReducedMotion()` |
| Skills marquee | CSS keyframes | `Skills.tsx` + `index.css` | CSS `@media` rules |
| Lenis smooth scroll | Library wrapper | `App.tsx` | Disabled via `REDUCED_MOTION` |

### Reduced-motion: EVERY animation must respect `prefers-reduced-motion`.
- JS: use `REDUCED_MOTION` from `constants/accessibility.ts` or FM's `useReducedMotion()`
- CSS: add rules inside `@media (prefers-reduced-motion: reduce)` block in `index.css`

### CityScene CSS sync
- CSS keyframe `city-scroll` uses `var(--city-width)` — set as CSS custom property on `<svg>` from `W` constant in `city-scene.ts`.

## Three.js / R3F Rules

- `bufferAttribute`: ALWAYS use `args={[array, itemSize]}`, never separate props
- NEVER use `useState` inside `useFrame` — causes 60fps re-renders. Use `useRef` only.
- Pre-allocate `THREE.Color`, `Euler`, `Matrix4`, `Vector3` at module scope for per-frame math (zero GC)
- `pointsMaterial` renders squares — use `CanvasTexture` with radial gradient for round particles
- `pointer-events-none` on Canvas wrapper blocks R3F mouse tracking — use `window.pointermove` + `useRef`
- `Math.random()` in `useMemo` needs `// eslint-disable-next-line react-hooks/purity` (or file-level disable for playground demos)

## Code Splitting

- Three.js chunk (~874KB) is lazy-loaded via `React.lazy()` in `Hero.tsx`
- Playground is lazy-loaded in `App.tsx`
- ErrorBoundary wraps HeroParticles to prevent WebGL crashes from breaking the app
- Main bundle: ~439KB (gzipped: ~142KB)

## Testing

- Vitest 3 + @testing-library/react + jsdom (vitest 4.0.x has a suite context bug on Windows/Node 22)
- Three.js mocked in tests with constructible stubs (Euler, Matrix4, Vector3, Color, CanvasTexture)
- Setup polyfills: matchMedia, IntersectionObserver, ResizeObserver

## Development Standards

- TypeScript strict mode, zero `any` types, zero `@ts-ignore`
- Zero `console.log` in production code
- Tailwind utility classes for all styling (no CSS files beyond `index.css`)
- Named constants for ALL magic numbers (extract to `constants/`)
- Keep dependencies minimal — no GSAP, no react-spring (FM v12 covers all needs)
