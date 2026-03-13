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
          if (id.includes("i18next") || id.includes("react-i18next")) {
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
