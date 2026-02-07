# Portfolio Polish Plan — Tracking Document

> **Purpose**: Persistent context between Claude Code sessions for the portfolio revamp.
> **Last Updated**: 2026-02-07

---

## Current Phase: Phase 1 — Fondations globales (en cours)

### What we're doing
Phase 1A + 1D done: cursor trailing global + particules Hero integrees dans le portfolio de production. Architecture `effects/` creee.

### Direction
- **Style**: Subtil, minimaliste, premium feel. Pas de flashy.
- **Focus**: ~70% bento grid (About section), ~30% global improvements
- **Inspiration**: tamalsen.dev (cursor glow), dennissnellenberg.com (transitions fluides)

---

## Decisions Made

| Decision | Choice | Reason |
|---|---|---|
| React Spring | NO — FM v12 has spring physics | No new dependency |
| GSAP | NO — FM covers our needs | No licence commerciale, FM suffit |
| Three.js | GARDER — particules validees pour Hero, CityScene3D a explorer | Particules = WOW factor |
| Bloc Parcours | Garder tel quel pour l'instant | Pas de remplacement decide |
| Code snippet content | **Fonction solve()** (`while (!done) { focus(); iterate(); }`) | Reflete le grind mindset de Patrick |
| Chess Board 3D | PAS dans le portfolio | Garde dans le playground mais pas integre |
| Particules Hero | **Demo 11** — glow texture, galaxie dense, tilt diagonal 10h→4h, twinkle, bright stars, fade-in 1.5s | Premium constellation |
| Demos 14-16 Hero | Gardees dans playground, PAS candidates pour integration | Patrick prefere Demo 11 |
| CityScene 3D | **EXPLORER** — parallax + lighting fixes appliques (Phase 0D) | Patrick re-evalue apres fix |
| Fun facts interets | Desktop: hover reveal / Mobile: toujours visibles | `useIsMobile()` existe |
| Curseur natif | GARDER VISIBLE | Ne pas cacher le curseur |
| Trailing curseur | Point cyan + anneau, actifs sur TOUTE la page | Plus tight que la demo actuelle |
| Spotlight fond | UNIQUEMENT dans les blocs/cards | Eviter le spotlight fige au scroll |
| Playground access | URL param `?playground=true` | Zero deps, temporary |
| Architecture effects | `src/components/effects/` | Dossier dedie aux effets visuels (layers) |
| CityScene 3D | OUBLIER demos 17-18 | Patrick a perdu interet |

## Decisions Pending

- [x] ~~Quelle variante Hero particles?~~ → **Demo 11 (ParticleFieldDemo)** — sphere, drift, rotation, repulsion curseur subtile
- [ ] CityScene 3D ou garder SVG? (flat ortho vs isometric vs SVG actuel) — Patrick re-evalue apres fix Phase 0D
- [ ] Should we reorganize the grid layout? (sizes, bloc order)
- [ ] Quel bloc remplace Parcours? (si changement)

---

## Bento Grid — Current State

```
[ Tagline (2 cols)  ] [ Parcours (1 col) ]  ← Garder tel quel pour l'instant
[ Stack (1) ] [ Interests (1) ] [ Snippet (1) ]
[          CityScene (3 cols)              ]  ← SVG actuel, potentiel remplacement 3D
```

### Bloc Status

| Bloc | Status | Notes |
|---|---|---|
| Tagline (2 cols) | Planned | Add glow pulse on highlight words |
| Parcours (1 col) | GARDER | Laisser tel quel pour l'instant |
| Stack favori (1 col) | Planned | Real SVG icons + stagger entry |
| Interests (1 col) | Planned | Hover micro-animations + fun fact reveal |
| Fun snippet (1 col) | Planned | solve() function + typing effect |
| CityScene (3 cols) | DONE (SVG) | Explorer remplacement Three.js |

---

## Global Improvements — Planned

| Improvement | Status | Description |
|---|---|---|
| Cursor trailing | **DONE** (Phase 1A) | `effects/CursorTrail.tsx` — dot 6px + ring 28px, springs tight, desktop only |
| Card spotlight hover | Phase 1B | Inner radial gradient tracking mouse in cards |
| Spring scroll reveals | Phase 1C | Replace CSS ease-out with FM spring physics |
| Hero particles | **DONE** (Phase 1D) | `effects/HeroParticles.tsx` — 2050 particules (2000+50 stars), glow texture, galaxie dense, tilt diagonal, twinkle, fade-in 1.5s |
| Grid stagger | Phase 3 | FM staggerChildren for organic reveal |

---

## Playground Demos — 18 total

Access: `localhost:5173?playground=true`

### Framer Motion (1-9)
1. Cursor Spotlight — global glow following mouse
2. Card Spotlight Hover — inner card glow tracking mouse
3. Spring Scroll Reveal — ease-out vs spring comparison
4. Stagger Children — cascade appearance
5. Glow Pulse — breathing highlight text
6. Typing Effect — character-by-character with syntax colors
7. Micro-animations Hover — icon bounce/rotate/vibrate
8. AnimatePresence — smooth expand/collapse
9. Creative Zone — Terminal animation

### Three.js (10-13)
10. **Echiquier 3D** — board 8x8, pieces geometriques, auto-rotate, cavalier anime
11. **Particules interactives** — 2000 points, reaction curseur (FIXED: mouse projection)
12. **Geometrie abstraite** — wireframe icosaedre, rotation, hover effect
13. **Vague mesh** — terrain ondulant low-poly (FIXED: Z coord bug)

### Hero Particles Variants (14-16) — NOUVEAU
14. **Hero Particles — Full Viewport** — 2000 particules, disque plat, repulsion curseur
15. **Hero Particles — Zone Centree** — 1500 particules, sphere 4r, masque radial
16. **Hero Particles — Nebuleuse** — 2500 particules, distribution gaussienne (Box-Muller)

### CityScene 3D Variants (17-18) — NOUVEAU
17. **CityScene 3D — Flat (Ortho)** — camera orthographique, meme look 2D, effets ameliores
18. **CityScene 3D — Isometrique** — camera perspective, batiments 3D avec profondeur

---

## File Architecture

```
src/components/effects/                ← NOUVEAU — effets visuels de production
├── CursorTrail.tsx                    ← Dot + ring FM springs (App-level)
└── HeroParticles.tsx                  ← Constellation Three.js (Hero, lazy-loaded)

src/components/playground/
├── Playground.tsx              ← Layout shell (header, nav, footer)
├── DemoSection.tsx             ← Shared demo wrapper
├── framer/
│   ├── CursorSpotlightDemo.tsx
│   ├── CardSpotlightDemo.tsx
│   ├── SpringRevealDemo.tsx
│   ├── StaggerDemo.tsx
│   ├── GlowPulseDemo.tsx
│   ├── TypingEffectDemo.tsx
│   ├── MicroAnimationsDemo.tsx
│   ├── ExpandCollapseDemo.tsx
│   └── TerminalDemo.tsx
└── three/
    ├── ChessBoardDemo.tsx
    ├── ParticleFieldDemo.tsx
    ├── AbstractGeometryDemo.tsx
    ├── WaveMeshDemo.tsx
    ├── HeroParticlesFullDemo.tsx
    ├── HeroParticlesZoneDemo.tsx
    ├── HeroParticlesNebulaDemo.tsx
    ├── CityScene3DFlatDemo.tsx
    └── CityScene3DIsometricDemo.tsx
```

Three.js demos are lazy-loaded (React.lazy + Suspense). Main bundle: ~460KB. Three.js chunk: ~874KB (loaded for playground + Hero particles).

---

## Phases Roadmap

### Phase 0: Setup & Playground — COMPLETE
- [x] Creer `docs/PLAN.md`
- [x] Playground FM (9 demos) — Patrick a evalue
- [x] Playground Three.js (4 demos) — echiquier, particules, geometrie, terrain
- [x] Fix WaveMeshDemo (Z coord bug)
- [x] Fix ParticleFieldDemo (mouse projection + effet plus prononce)
- [x] Hero Particles x3 variantes (full, zone, nebuleuse)
- [x] CityScene 3D x2 variantes (flat ortho, isometric)
- [x] Restructuration playground (framer/ + three/ folders)
- [x] Patrick a teste — Hero particles: **Demo 11 gagnante**
- [x] Fix CityScene3D parallax (parent group wrapping) + lighting isometric
- [ ] **Patrick re-evalue CityScene 3D apres fix**

### Phase 1: Fondations globales — EN COURS
- [x] 1A — Cursor trailing global → `src/components/effects/CursorTrail.tsx`
- [ ] 1B — Card spotlight hover / SpotlightCard (spotlight seulement dans les cartes)
- [ ] 1C — Upgrade ScrollReveal vers spring physics
- [x] 1D — Particules Hero → `src/components/effects/HeroParticles.tsx` (lazy-loaded)

### Phase 2: Blocs du bento — un par un
- [ ] 2A — Tagline: glow pulse sur les highlights
- [ ] 2B — Bloc Parcours: garder tel quel (decision revisitee en Phase 3)
- [ ] 2C — Stack favori: icones reelles + stagger
- [ ] 2D — Interets: micro-animations hover + fun facts
- [ ] 2E — Code snippet: **fonction solve()** + typing effect au scroll
- [ ] 2F — CityScene: remplacer SVG par Three.js (si valide au playground)

### Phase 3: Polish & decisions
- [ ] Stagger global du grid
- [ ] Evaluer reorganisation du grid
- [ ] Responsive (mobile/tablet/desktop)
- [ ] Accessibilite (reduced motion)
- [ ] Performance (bundle size, Three.js code splitting)
- [ ] Cleanup: supprimer playground

---

## Framer Motion — Current Usage (under-utilized)

| File | What's used |
|---|---|
| Hero.tsx | motion.p/span/div/svg — word-by-word reveal, variants |
| ScrollReveal.tsx | useInView + useReducedMotion (hooks only, CSS transitions) |
| ScreenshotFan.tsx | motion.div, useScroll, useTransform — spring physics |
| CityScene.tsx | useInView only — rest is pure CSS |

**Not using FM**: Navbar, About, Skills, Contact, Section, Footer

---

## Reference Links

### Portfolios
- https://dennissnellenberg.com
- https://maxmilkin.com
- https://edoardolunardi.dev
- https://tamalsen.dev

### Component Libraries
- https://ui.aceternity.com/components/bento-grid
- https://ui.aceternity.com/components
- https://magicui.design/docs/components/bento-grid

### Portfolio Aggregators
- https://www.awwwards.com/websites/portfolio/
- https://www.wallofportfolios.in/dark-theme
- https://pafolios.com
