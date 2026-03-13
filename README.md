# halterofit.ca

Personal portfolio — **[halterofit.ca](https://halterofit.ca)**

## Stack

React · TypeScript · Vite (Rolldown) · Vite+ · Tailwind CSS · Framer Motion · Three.js / R3F · i18next

## Tooling

| Tool | Role |
|------|------|
| `vp dev` / `vp build` | Dev server & production build (Vite+ CLI) |
| `vp check` | Lint (Oxlint) + format (Oxfmt) + typecheck |
| Vitest | Unit & component tests with coverage thresholds |
| GitHub Actions | CI on push — check → test → build |
| Cloudflare Pages | Hosting, auto-deploy from `main` |

## Highlights

- Bilingual FR/EN with full i18next integration
- Interactive 3D particle constellation (Three.js + R3F)
- Custom dual-element cursor trail with spring-damped physics
- Every animation respects `prefers-reduced-motion`
- Smooth scroll via Lenis (disabled on mobile)
- Manual chunk splitting (React, i18n, Framer Motion)

## Getting started

```bash
npm install           # use --legacy-peer-deps until @tailwindcss/vite supports Vite 8
npm run dev           # start dev server
npm run build         # production build (Rolldown)
npm run check         # lint + format + typecheck
npm test              # run tests
npm test -- --coverage  # with coverage thresholds
```

## Project structure

```
src/
  components/
    effects/      # HeroParticles, CursorTrail
    layout/       # Navbar, Footer, Section, NotFound
    sections/     # Hero, About, Projects, Skills, Contact
    ui/           # SpotlightCard, ScrollReveal, ErrorBoundary, ProjectCard
    playground/   # Experimental demos (excluded from coverage)
  hooks/          # useIsMobile
  constants/      # Named magic numbers (animation, layout, styles)
  data/           # Static typed data (projects, skills, about)
  i18n/           # fr.json, en.json
  utils/          # cn (clsx alias), math helpers
```
