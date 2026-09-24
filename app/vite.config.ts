import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // relative base so `npm run build` works at any subpath (GitHub Pages
  // deploys under /missing-seats/) without passing --base
  base: "./",
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: "node",
  },
});
