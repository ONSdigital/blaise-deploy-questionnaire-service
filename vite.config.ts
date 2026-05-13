import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  appType: "spa",
  plugins: [react()],
  build: {
    outDir: "build/client",
    sourcemap: true,
  },
  server: {
    port: 3000,
    proxy: {
      "/api": { target: "http://localhost:5000", changeOrigin: true },
      "/upload": { target: "http://localhost:5000", changeOrigin: true },
      "/bucket": { target: "http://localhost:5000", changeOrigin: true },
    },
  },
});
