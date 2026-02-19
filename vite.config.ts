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
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          i18n: ["i18next", "react-i18next"],
          "framer-motion": ["framer-motion"],
        },
      },
    },
  },
}));
