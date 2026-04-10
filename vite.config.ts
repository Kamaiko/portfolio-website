/// <reference types="vitest/config" />
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
      ? [
          visualizer({
            open: true,
            filename: "stats.html",
            template: "treemap",
            gzipSize: true,
          }) as PluginOption,
        ]
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
  test: {
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/components/playground/**",
        "src/components/effects/HeroParticles.tsx",
        "src/main.tsx",
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
}));
