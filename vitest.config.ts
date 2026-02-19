import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
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
