# Portfolio — site personnel (depot: portfolio-website)

## Quick Facts
- **Stack**: React 19 + TypeScript 5.9 + Vite 8 + Vite+ Alpha (unified toolchain) + Tailwind CSS v4 + Framer Motion + Three.js/R3F
- **Tooling**: Oxlint (lint) · Oxfmt (format) · vp CLI (vite-plus)
- **Node**: 22 (pinned via `.node-version` for Cloudflare Pages + CI)
- **Package manager**: npm (`.npmrc` a `legacy-peer-deps=true` — requis par la peer dep de @tailwindcss/vite)
- **Hosting**: Cloudflare Pages (halterofit.ca)
- **Language**: FR primary, EN secondary (i18next)

## Commands
```
npm run dev          # Dev server (vp dev)
npm run build        # vp build (Rolldown bundler)
npm run check        # vp check (oxlint + oxfmt + typecheck)
npm run test         # vitest run
npm test -- --coverage  # With thresholds (seuils dans la config)
npm run analyze      # Bundle treemap (vp build --mode analyze)
npm run preview      # Preview production build (vp preview)
npm install --legacy-peer-deps  # Requis par la peer dep de @tailwindcss/vite
```

## Project Structure
```
src/
  components/
    effects/        # Animation & interactive (CursorTrail, HeroParticles)
    layout/         # Navbar, Footer, Section, NotFound
    sections/       # Hero, About, Projects, Skills, Contact
    ui/             # Reusable: SpotlightCard, ScrollReveal, ErrorBoundary, ProjectCard
    playground/     # Experimental demos (framer/, three/, canvas/) — excluded from coverage
  hooks/            # Custom hooks (useIsMobile)
  constants/        # Extracted magic numbers (animation, layout, accessibility, styles, visual-effects)
  data/             # Static typed data (projects, skills, about, contact)
  types/            # Type declarations
  utils/            # cn (clsx alias), math helpers
  i18n/             # index.ts + fr.json + en.json
  __tests__/        # Test setup (setup.ts with polyfills)
```

## Code Conventions

### Components
- **Default exports** for all components: `export default function ComponentName()`
- **Named exports** for data and utilities
- **Props**: interface above component, destructured in params
- **Import order**: React → third-party → local (constants, utils, components)

### Naming
- Extract ALL magic numbers to named constants
- **Suffixes**: `_S` (seconds), `_MS` (milliseconds), `_PX` (pixels), `_RGB` (color)
- Constants: `SCREAMING_SNAKE_CASE`
- Components: `PascalCase`, files match component name
- Hooks: `useCamelCase`

### Styling
- Tailwind v4 (zero-config via `@tailwindcss/vite`, no `tailwind.config`)
- `cn()` utility from `src/utils/cn.ts` (clsx alias) for class composition
- Gradient syntax: `bg-linear-to-r` (NOT `bg-gradient-to-r`)
- Reusable class constants in `src/constants/styles.ts`
- Color palette: cyan-400/500 primary, slate-950/900/800 base

### Linting
- Oxlint via `vp check` (replaces ESLint) — config: `.oxlintrc.json`, plugins: typescript, react
- Oxfmt via `vp check` (replaces Prettier) — config: `.oxfmtrc.json`
- `no-shadow` off: false positives on destructured useMemo and TS type shadowing
- `no-useless-constructor` off: polyfill stubs in test setup.ts have empty constructors
- Former `eslint-disable` comments (react-hooks/purity) removed — Oxlint n'a pas encore d'equivalent

### TypeScript
- Strict mode enabled, no `any`
- `as const` for readonly constant arrays/objects
- Composite build (`tsc -b`); type-checking also runs via `vp check` and `vp build`

## Testing

### Setup
- Vitest + `@vitest/coverage-v8` — **les deux versions doivent correspondre**
- Test config merged into `vite.config.ts` (test block), no separate vitest.config.ts
- jsdom environment with polyfills in `src/__tests__/setup.ts`: matchMedia, IntersectionObserver, ResizeObserver
- Explicit `afterEach(cleanup)` required (auto-cleanup needs `globals: true`)
- Coverage excludes R3F/WebGL components (HeroParticles, NotFound3D) and main.tsx — untestable in jsdom
- `"test": "vitest run"` used instead of `vp test` (vp test bundles its own Chai instance, breaking jest-dom matchers)

### Test Patterns
- Colocated: `Component.tsx` + `Component.test.tsx` side by side
- `vi.hoisted()` for overriding module-scope constants BEFORE module evaluation
- Mutable mocks: use getter in `vi.mock` factory (`get CONSTANT() { return mockValue }`)
- **Fake timers + waitFor**: DO NOT combine — use `act(() => vi.advanceTimersByTime(n))` instead
- **Fake timers + RAF**: explicitly `vi.advanceTimersByTime(16)` inside `act()` to flush
- jsdom scroll values default to 0: must `Object.defineProperty` innerHeight/scrollY/scrollHeight

## Three.js / R3F Gotchas
- **useFrame delta**: MUST use 2nd param `(state, delta)` — NEVER `state.clock.getDelta()` (returns ~0)
- **visible={false}**: prevents raycasting. Use `<meshBasicMaterial transparent opacity={0} />` instead
- **Three.js mocks**: provide constructible stubs (Euler, Matrix4, Vector3, Color, CanvasTexture)
- **Particle drift vs rotation**: XZ drift must be < 7% of rotation tangential speed
- **Selective imports**: HeroParticles uses `import { Vector3 } from "three"`, NOT `* as THREE`

## Deployment
- **Cloudflare Pages**: auto-deploys from `main`, build command `npm run build`, output `dist/`
- `.node-version` (value: `22`) tells Cloudflare which Node to use
- `.npmrc` (`legacy-peer-deps=true`) ensures `npm install` succeeds on Cloudflare (no `--legacy-peer-deps` flag available there)
- Retirer le contournement `.npmrc` quand `@tailwindcss/vite` supports Vite 8 peer dep

## Git Workflow
- **Branches**: `dev` (development) → `main` (production)
- **Commit format**: `type: description` — types: feat, fix, refactor, chore, docs, test
- **CI**: GitHub Actions on push to dev/main and PRs to main (check → test+coverage → build)
- CI uses `npm ci --legacy-peer-deps` (mirrors `.npmrc` setting)
- **Never**: force-push to main, skip hooks, commit .env or secrets

## Architecture Decisions
- Direction: subtle, minimalist, premium — NOT flashy
- Hero Particles: Demo 11 pattern (rotation ~0.08 rad/s at production distance)
- Cursor: trailing dual-element, native cursor VISIBLE
- Spotlight effect: ONLY inside cards/blocs, not global
- Bloc Parcours: keep as-is (no changes)
- 404 Easter Egg: playground demos only (Runner, Particles, Destruction)
- Fun facts: desktop hover-reveal, mobile always-visible
- Always find root cause — no workarounds ("interdit le ductape")





