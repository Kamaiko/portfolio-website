# Claude Instructions — Halterofit Portfolio

> **Updated**: 2026-02-09

## Overview

Portfolio for Patrick Patenaude at **halterofit.ca**. Single-page React app, bilingual FR/EN, dark theme, deployed on Cloudflare Pages via `main` branch. Dev work on `dev`.

## Tech Stack

TypeScript 5.9 (strict) · React 19 · Vite 7 · Tailwind CSS 4 · Framer Motion 12 · react-i18next 16 · Three.js + R3F + drei · Lenis (smooth scroll) · Lucide React (icons) · clsx (via `cn()`)

## Commands

```bash
npm run dev       # localhost:5173
npm run build     # tsc + vite build → dist/
npm run lint      # ESLint
npx vitest run    # Tests (jsdom)
```

## Folder Convention

```
src/
├── constants/       # Named tokens (SCREAMING_SNAKE). No magic numbers.
├── data/            # ALL static data arrays/objects. Never inline in components.
├── hooks/           # Custom hooks (useIsMobile, etc.)
├── i18n/            # fr.json + en.json — MUST mirror each other's key structure
├── components/
│   ├── layout/      # Page structure (Navbar, Footer, Section, NotFound)
│   ├── sections/    # Full-page content sections (Hero, About, Projects, Skills, Contact)
│   ├── ui/          # Reusable UI (cards, scroll reveal, spotlight, error boundary)
│   ├── effects/     # Visual effect layers (CursorTrail, HeroParticles)
│   └── playground/  # Dev-only demos (?playground=true), lazy-loaded
└── __tests__/       # Vitest + @testing-library/react (jsdom)
```

## Conventions (MUST follow)

### Naming (non-standard rules only)
- **Constants**: SCREAMING_SNAKE (`NAV_HEIGHT`, `PARTICLE_COUNT`, `CARD_BASE`)
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

## Animation Rules

### Reduced-motion: EVERY animation must respect `prefers-reduced-motion`.
- JS: use `REDUCED_MOTION` from `constants/accessibility.ts` or FM's `useReducedMotion()`
- CSS: add rules inside `@media (prefers-reduced-motion: reduce)` block in `index.css`
- R3F/Three.js components (HeroParticles, NotFound3D) return `null` when reduced-motion is on

## Three.js / R3F Rules

- `bufferAttribute`: ALWAYS use `args={[array, itemSize]}`, never separate props
- NEVER use `useState` inside `useFrame` — causes 60fps re-renders. Use `useRef` only.
- Pre-allocate `THREE.Color`, `Euler`, `Matrix4`, `Vector3` at module scope for per-frame math (zero GC)
- `pointsMaterial` renders squares — use `CanvasTexture` with radial gradient for round particles
- `pointer-events-none` on Canvas wrapper blocks R3F mouse tracking — use `window.pointermove` + `useRef`
- `Math.random()` in `useMemo` needs `// eslint-disable-next-line react-hooks/purity` (or file-level disable for playground demos)

## Code Splitting

- Three.js scenes and Playground are `React.lazy()` loaded — never import eagerly
- ErrorBoundary wraps all R3F scenes to prevent WebGL crashes from breaking the app

## Testing

- Vitest **3.x only** — vitest 4.0.x has a suite context bug on Windows/Node 22
- `@vitest/coverage-v8` must be pinned to same version as vitest
- Three.js mocked with constructible stubs (Euler, Matrix4, Vector3, Color, CanvasTexture)
- `afterEach(cleanup)` required in setup.ts (auto-cleanup needs `globals: true`)
- Fake timers: use `act(() => vi.advanceTimersByTime(n))` instead of `waitFor` (hangs)
- Module-scope constants: use `vi.hoisted()` to override before module evaluation

## Repository Etiquette

- Dev work on `dev` branch, deploy via `main`
- PR into `main` for production deploys (Cloudflare Pages)
- Conventional commits: `feat:`, `fix:`, `chore:`, `perf:`, `refactor:`

## Development Standards

- Zero `any` types, zero `@ts-ignore`, zero `console.log` in production
- No CSS files beyond `index.css` (Tailwind utilities only)
- Named constants for ALL magic numbers (extract to `constants/`)
- Dependencies: no GSAP, no react-spring — Framer Motion v12 covers all needs
- `bg-linear-to-r` is correct Tailwind v4 gradient syntax (not `bg-gradient-to-r`)
