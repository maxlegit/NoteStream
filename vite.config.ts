import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // adjust if needed
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
