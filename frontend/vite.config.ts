import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

const vitePort = Number(process.env.WAILS_VITE_PORT) || 5173;

export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@bindings": path.resolve(__dirname, "bindings"),
    },
  },
  server: {
    port: vitePort,
    strictPort: true,
    host: "127.0.0.1",
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
