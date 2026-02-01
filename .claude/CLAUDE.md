# Claude Instructions - Halterofit Portfolio Website

> **Last Updated**: 2026-01-31
> **Purpose**: AI agent project briefing for the portfolio website

---

## What This Is

Personal portfolio website for Patrick Patenaude, hosted on **halterofit.ca** via Cloudflare Pages. Single-page React app with bilingual FR/EN support.

---

## Tech Stack

| Techno | Version | Role |
|---|---|---|
| **TypeScript** | 5.9 | Language |
| **React** | 19.2 | UI framework |
| **Vite** | 7.x | Build tool + dev server |
| **Tailwind CSS** | 4.x | Styling (utility classes) |
| **Framer Motion** | 12.x | Scroll animations, transitions |
| **react-i18next** | 16.x | Bilingual FR/EN |
| **Lucide React** | 0.563 | Icons |

---

## Quick Commands

```bash
npm run dev       # Start dev server (localhost:5173)
npm run build     # TypeScript check + production build (outputs to dist/)
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

---

## Project Structure

```
src/
├── main.tsx              # Entry point
├── App.tsx               # Root component, assembles all sections
├── index.css             # Tailwind import + global styles (Inter font, smooth scroll)
├── i18n/
│   ├── index.ts          # i18next config (default: FR)
│   ├── fr.json           # French translations
│   └── en.json           # English translations
├── components/
│   ├── Navbar.tsx         # Fixed nav + FR/EN toggle + mobile menu
│   ├── Hero.tsx           # Name, title, CTA buttons (fade-in animation)
│   ├── Section.tsx        # Reusable wrapper (title + whileInView animation)
│   ├── About.tsx          # Bio paragraphs
│   ├── Projects.tsx       # Grid layout for project cards
│   ├── ProjectCard.tsx    # Individual project card (tech badges, links)
│   ├── Skills.tsx         # 3-column grid (Languages, Frameworks, Tools)
│   ├── Contact.tsx        # Email, CV download, social links
│   └── Footer.tsx         # Copyright
└── data/
    └── projects.ts        # Project definitions (GitHub URLs, translation keys)
```

---

## Deployment

- **Hosting**: Cloudflare Pages (free tier)
- **Domain**: halterofit.ca (Cloudflare registrar)
- **Auto-deploy**: Every `git push` to `main` triggers a build on Cloudflare
- **Build settings on Cloudflare**: command = `npm run build`, output = `dist`
- **Preview URLs**: Non-main branches deploy to `<branch>.halterofit-website.pages.dev`

---

## Design System

- **Theme**: Dark mode (slate-950 background, slate-100 text)
- **Accent color**: emerald-400 / emerald-500
- **Font**: Inter (loaded from Google Fonts in index.html)
- **Animations**: Framer Motion fade-in on scroll (`whileInView`), hover effects
- **Layout**: Max-width 5xl (1024px), centered, generous padding

---

## Internationalization

- Default language: French (FR)
- Toggle in Navbar switches between FR and EN
- All user-facing text is in `src/i18n/fr.json` and `src/i18n/en.json`
- Translation keys follow nested structure: `section.key` (e.g., `hero.title`, `projects.halterofit.description`)
- When adding new text: add to BOTH fr.json and en.json

---

## Adding a New Project

1. Add translation keys in `src/i18n/fr.json` and `src/i18n/en.json` under `projects.newproject`
2. Add entry in `src/data/projects.ts`
3. Optionally add screenshot in `public/images/`

---

## Known TODOs

- [ ] Add real CV PDF to `public/cv-patrick-patenaude.pdf`
- [ ] Update LinkedIn link in `Contact.tsx` (currently placeholder)
- [ ] Add project screenshots in `public/images/`
- [ ] Add SEO meta tags (og:title, og:description, og:image)
- [ ] Add custom favicon
- [ ] Active section highlight in Navbar (Intersection Observer)
- [ ] Accessibility improvements (aria-labels, focus states)

---

## Development Standards

- TypeScript strict mode, no `any` types
- Tailwind utility classes for all styling (no CSS files beyond index.css)
- All text must be internationalized (no hardcoded strings)
- Components should be self-contained and reusable where possible
- Keep dependencies minimal
