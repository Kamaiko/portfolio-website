# Portfolio-website Migration Plan: Vite 7 → Vite 8 → Vite+

> **Date**: March 13, 2026
> **Project**: Portfolio-website (C:\DevTools\Projects\Portfolio-website)
> **Author**: Migration planned with Claude Code agent

---

## Phase 1: Vite 8 Migration — COMPLETED

### What was done
- Upgraded `vite` 7.2.4 → **8.0.0** and `@vitejs/plugin-react` 5.1.1 → **6.0.1**
- Upgraded `vitest` 3.2.4 → **4.1.0** and `@vitest/coverage-v8` 3.2.4 → **4.1.0**
- Added `@testing-library/dom` ^10.4.1 (became required as explicit dependency after peer dep resolution change)
- Converted `manualChunks` from object format to function format (Rolldown requires function, not object)

### Issues encountered and resolved

**1. `@tailwindcss/vite` peer dependency conflict**
- `@tailwindcss/vite@4.2.1` declares `peerDependencies: { vite: "^5.2.0 || ^6 || ^7" }` — doesn't include Vite 8 yet
- **Workaround**: Used `npm install --legacy-peer-deps` to bypass
- **Resolution**: Will resolve itself when Tailwind publishes an update adding Vite 8 to their peer deps (expected within days/weeks)
- Until then, `--legacy-peer-deps` is needed for any `npm install` in this project

**2. `manualChunks` format incompatibility**
- Rolldown (Vite 8's bundler) only accepts `manualChunks` as a **function**, not as an object map
- Build error: `TypeError: manualChunks is not a function`
- **Fix**: Converted from object syntax to function syntax:
```ts
// BEFORE (Rollup — object format)
manualChunks: {
  "react-vendor": ["react", "react-dom"],
  i18n: ["i18next", "react-i18next"],
  "framer-motion": ["framer-motion"],
}

// AFTER (Rolldown — function format)
manualChunks(id) {
  if (id.includes("react-dom") || id.includes("react/")) return "react-vendor";
  if (id.includes("i18next")) return "i18n";
  if (id.includes("framer-motion")) return "framer-motion";
}
```

**3. `@testing-library/dom` missing**
- After upgrading with `--legacy-peer-deps`, `@testing-library/dom` was no longer auto-installed as a transitive dependency
- Tests failed with `Cannot find module '@testing-library/dom'`
- **Fix**: Added as explicit devDependency: `npm install @testing-library/dom --legacy-peer-deps`

### Post-migration audit findings (resolved)

**4. `@testing-library/dom` was in `dependencies` instead of `devDependencies`**
- It's a test-only package — should never ship to production
- **Fix**: Moved to `devDependencies`

**5. Redundant `id.includes("react-i18next")` in `manualChunks`**
- `"react-i18next"` always contains `"i18next"`, so `id.includes("i18next")` already catches both packages
- **Fix**: Simplified condition to just `id.includes("i18next")`

**6. `rollup-plugin-visualizer` compatibility confirmed**
- v6.0.5 declares `peerDependencies` including `rolldown: "1.x || ^1.0.0-beta"` — fully compatible with Vite 8
- `npm run analyze` works correctly

**7. `as PluginOption` type cast still valid**
- Vite 8 did not change the `PluginOption` type — cast is correct

### Verified results
- **Build**: 817ms, all chunks correctly split (react-vendor, i18n, framer-motion)
- **Tests**: 24/24 passed, 7/7 suites
- **Dev server**: Starts in 517ms
- `rollup-plugin-visualizer` remains in config (conditionally loaded in analyze mode only — not tested but not blocking)

---

## Current Stack (Post-Phase 1)

| Category | Tool | Version | Config File |
|---|---|---|---|
| Bundler / Dev Server | **Vite (Rolldown)** | **8.0.0** | `vite.config.ts` |
| React Plugin | **@vitejs/plugin-react (Oxc)** | **6.0.1** | — |
| Framework | React + TypeScript | 19.2.0 / 5.9.3 | `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` |
| CSS | Tailwind CSS (@tailwindcss/vite) | 4.1.18 | `src/index.css` |
| Linting | ESLint (flat config) | 9.39.1 | `eslint.config.js` |
| Formatting | Prettier | 3.8.1 | `.prettierrc` |
| Testing | **Vitest** + Testing Library | **4.1.0** | `vitest.config.ts` |
| Coverage | **@vitest/coverage-v8** | **4.1.0** | inside `vitest.config.ts` |
| Package Manager | npm | — | `package-lock.json` |
| Bundle Analysis | rollup-plugin-visualizer | 6.0.5 | conditional in `vite.config.ts` |
| 3D Graphics | Three.js + @react-three/fiber + drei | 0.182.0 | — |
| Animation | Framer Motion | 12.29.2 | — |
| i18n | i18next + react-i18next | 25.8.0 | `src/i18n/` |
| Smooth Scroll | Lenis | 1.3.17 | — |

### Current npm scripts (unchanged)
```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "analyze": "vite build --mode analyze",
  "lint": "eslint .",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

### Current vite.config.ts (updated)
```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";
import type { PluginOption } from "vite";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    ...(mode === "analyze"
      ? [visualizer({ open: true, filename: "stats.html", template: "treemap", gzipSize: true }) as PluginOption]
      : []),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("react-dom") || id.includes("react/")) {
            return "react-vendor";
          }
          if (id.includes("i18next")) {
            return "i18n";
          }
          if (id.includes("framer-motion")) {
            return "framer-motion";
          }
        },
      },
    },
  },
}));
```

### ESLint config (eslint.config.js) — unchanged
- Uses: `@eslint/js` recommended, `typescript-eslint` recommended, `react-hooks` flat recommended, `react-refresh` vite config, `eslint-config-prettier`
- User does NOT have custom rules — uses standard recommended configs only

### Vitest config (vitest.config.ts) — unchanged
- Environment: jsdom
- Setup file: `./src/__tests__/setup.ts`
- Include: `src/**/*.test.{ts,tsx}`
- Coverage: v8 provider, thresholds (statements: 75, branches: 78, lines: 75)
- Excludes: playground components, types, constants, data, test files

### Prettier config (.prettierrc) — unchanged
- Semi: true, single quotes: false, tab width: 2, trailing comma: all, print width: 100

---

## Phase 2: Migrate to Vite+ Alpha (on separate branch)

### WHY this migration?
Vite+ unifies the entire JavaScript/TypeScript toolchain into a single CLI (`vp`). Instead of managing 6+ separate tools with separate configs (Vite, ESLint, Prettier, Vitest, tsc, npm scripts), everything runs through one command with one config file. All tools are Rust-based, delivering 30-100x performance improvements.

### Step 0: Create branch
```bash
git checkout -b feature/vite-plus-migration
```

### Step 1: Install Vite+
On Windows PowerShell:
```powershell
irm https://vite.plus/ps1 | iex
```

Then run the migration tool:
```bash
vp migrate
```
This analyzes the project and auto-converts what it can. Recommendation: upgrade to Vite 8 first (done) and optionally migrate to Oxlint/Oxfmt before full adoption.

### Step 2: Replace ESLint → Oxlint

**WHY:** Oxlint implements 600+ ESLint-compatible rules in Rust, running 50-100x faster. Since this project uses only standard recommended configs (no custom rules), all rules have Oxlint equivalents.

Remove from devDependencies:
- `eslint`
- `@eslint/js`
- `typescript-eslint`
- `eslint-plugin-react-hooks`
- `eslint-plugin-react-refresh`
- `eslint-config-prettier`
- `globals`

Delete: `eslint.config.js`

Configure Oxlint in `vite.config.ts` (or let `vp migrate` handle it).

### Step 3: Replace Prettier → Oxfmt

**WHY:** Oxfmt achieves 100% Prettier compatibility (passes all conformance tests) while being 36x faster. It supports the same options.

Map current `.prettierrc` settings:
- `semi: true` → Oxfmt default
- `singleQuote: false` → Oxfmt default
- `tabWidth: 2` → Oxfmt default
- `trailingComma: "all"` → Oxfmt equivalent
- `printWidth: 100` → Oxfmt equivalent

Remove from devDependencies: `prettier`
Delete: `.prettierrc`

### Step 4: Unify Vitest config

**WHY:** Vite+ manages Vitest natively. Instead of a separate `vitest.config.ts`, the test config lives inside `vite.config.ts`.

Merge into `vite.config.ts`:
```ts
export default defineConfig({
  // ... existing plugins and build config
  test: {
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      include: ["src/**"],
      exclude: [
        "src/components/playground/**",
        "src/types/**",
        "src/constants/**",
        "src/data/**",
        "src/**/*.test.{ts,tsx}",
        "src/__tests__/**",
      ],
      thresholds: {
        statements: 75,
        branches: 78,
        lines: 75,
      },
    },
  },
});
```

Delete: `vitest.config.ts`

### Step 5: Update package.json scripts
```json
{
  "scripts": {
    "dev": "vp dev",
    "build": "vp build",
    "check": "vp check",
    "test": "vp test",
    "test:watch": "vp test --watch",
    "preview": "vp preview"
  }
}
```

**WHY:** `vp check` runs lint + format + type-check in parallel — replacing three separate commands with one. The `tsc -b` in the build script is no longer needed because `vp build` handles type-checking.

### Step 6: Clean up devDependencies
Remove all packages now handled by Vite+:
- All `eslint*` packages
- `prettier`
- `rollup-plugin-visualizer`
- `globals`
- Potentially `vitest` and `@vitest/coverage-v8` if bundled by vp

### Step 7: Test everything
```bash
vp dev              # Dev server works
vp build            # Production build works
vp test             # All tests pass, coverage thresholds met
vp check            # Lint + format + typecheck works
```

Manual verification checklist:
- [ ] Three.js 3D scenes render correctly (Hero, Playground demos)
- [ ] Framer Motion animations work (section transitions, playground demos)
- [ ] i18n switching works (EN ↔ FR)
- [ ] Smooth scroll (Lenis) works
- [ ] Tailwind styles applied correctly
- [ ] Navbar, Footer, all sections render
- [ ] Oxlint catches the same issues ESLint did
- [ ] Oxfmt formats consistently with old Prettier output

### Step 8: Commit on feature branch
Commit message: "feat: migrate to Vite+ Alpha (unified toolchain)"
Do NOT merge to main until validated.

---

## Agent Instructions

When executing this migration:
1. **Be educational**: Briefly explain WHY each change is made (1-2 sentences max, don't overload context)
2. **Be incremental**: Complete Phase 1 fully before starting Phase 2
3. **Test after each step**: Don't batch changes — verify as you go
4. **Preserve functionality**: The site must work identically after migration
5. **If something breaks**: Diagnose the root cause, don't hack around it. If it's a Vite 8/Vite+ alpha bug, document it and consider reverting that specific change
6. **rollup-plugin-visualizer**: Not critical — remove if incompatible rather than spending time fixing
7. **ESLint rules**: User uses standard recommended configs only, no custom rules to preserve
8. **Prettier config**: Simple defaults, should map 1:1 to Oxfmt
9. **`--legacy-peer-deps`**: Required until `@tailwindcss/vite` publishes a version supporting Vite 8 peer deps
10. **`manualChunks`**: Must be a function (not object) for Rolldown — this is a known Rollup→Rolldown breaking change
