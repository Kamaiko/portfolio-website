# Tech Debt Backlog

Items tracked here are workarounds that need to be cleaned up when upstream dependencies or tooling catch up.

---

## 1. Remove `legacy-peer-deps` workaround

**Added:** 2026-03-13 (v2.0.0 — Vite+ Alpha migration)

**Problem:** `@tailwindcss/vite@4.1.18` declares `peerDependencies: { vite: "^5.2.0 || ^6 || ^7" }` but we use Vite 8. `npm install` fails without `--legacy-peer-deps`.

**Current workaround:**

- `.npmrc` → `legacy-peer-deps=true`
- `.github/workflows/ci.yml` → `npm ci --legacy-peer-deps`

**Files to update when removing:**

1. `.npmrc` — delete `legacy-peer-deps=true` (or delete file if it's the only line)
2. `.github/workflows/ci.yml` — change `npm ci --legacy-peer-deps` to `npm ci`

**When to remove:** Once `@tailwindcss/vite` updates its peer range to include `^8`.

**How to check:**

```bash
npm ls vite          # no ERESOLVE / peer dep warnings = safe to remove
npm install          # succeeds without --legacy-peer-deps = safe to remove
```

---

## 2. Fix white elliptical flash on page load

**Added:** 2026-03-13
**Previous fix attempts:** 5-6 iterations without success

**Problem:** On every page load/refresh, a large white elliptical glow appears in the center of the hero section for ~100-300ms before the particle constellation renders. The navbar, text, and dark background are all correct — only the hero canvas area flashes white.

**Visual:** A bright white oval filling most of the hero viewport, matching the shape of the vignette mask.

**Root cause:** The R3F `<Canvas>` in `HeroParticles.tsx` has a white default background. The vignette mask (`VIGNETTE_MASK` line 38) is:

```
radial-gradient(ellipse at center, black 50%, transparent 100%)
```

This mask reveals the center of the canvas as an ellipse. The loading sequence is:

1. React mounts `Hero.tsx` — dark background, text, spotlights render instantly ✅
2. `HeroParticles` lazy-loads via `Suspense` → Canvas element is created
3. Canvas has **default white clear color** — vignette mask reveals it as a white ellipse ⚠️
4. WebGL context initializes, particles render, white disappears ✅

The flash is the gap between steps 2 and 4.

**Why previous simple fixes failed:**

- `style="background:#020617"` on `<body>` doesn't help — the dark bg is already there, the flash comes from the Canvas element itself
- The Canvas is lazy-loaded (`React.lazy` + `Suspense`), so it mounts asynchronously
- The `opacity: 0 → 1` fade-in (`FADE_IN_DELAY_MS = 100ms`, `duration-1500`) was meant to mask this, but 100ms isn't enough for WebGL init
- Setting `gl={{ alpha: true }}` could help but may affect particle blending (additive blend on transparent canvas)

**Possible fixes to investigate:**

1. Increase `FADE_IN_DELAY_MS` — delay opacity transition until WebGL is likely ready (300-500ms)
2. Add `gl={{ alpha: true }}` + transparent bg — Canvas becomes transparent, dark page shows through
3. Set Canvas clear color to slate-950 via `onCreated` — match the page bg before particles render
4. Use `onCreated` callback to only show canvas after WebGL context is ready, then fade in
5. Render a dark overlay on top of the Canvas that fades out once particles are rendering

**Key files:**

- `src/components/effects/HeroParticles.tsx` — Canvas wrapper (lines 445-480), vignette mask (line 38), fade-in delay (line 35)
- `src/components/sections/Hero.tsx` — Suspense/ErrorBoundary wrapping (lines 163-169)

**Severity:** Low-Medium (cosmetic, <0.5s, but very visible on every page load)

**Status:** Not yet fixed — needs deeper investigation of Canvas initialization timing.
