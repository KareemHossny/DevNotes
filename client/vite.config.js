import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    rollupOptions: {
      treeshake: true,
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/scheduler/") ||
            id.includes("node_modules/loose-envify/")
          ) {
            return "react-core";
          }

          if (
            id.includes("node_modules/react-router/") ||
            id.includes("node_modules/react-router-dom/") ||
            id.includes("node_modules/@remix-run/router/")
          ) {
            return "router";
          }

          if (id.includes("node_modules/axios/")) {
            return "http";
          }

          if (id.includes("node_modules/react-icons/")) {
            return "icons";
          }

          return "vendor";
        },
      },
    },
  },
  server: {
    port: 5173,
  },
});
