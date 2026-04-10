import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
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
});
