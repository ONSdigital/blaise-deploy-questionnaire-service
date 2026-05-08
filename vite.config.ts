import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  appType: "spa",
  plugins: [react()],
  resolve: {
    alias: {
      "blaise-login-react/blaise-login-react-client": path.resolve(
        __dirname,
        "src/tests/utils/mockAuthenticate.tsx",
      ),
    },
  },
  build: {
    outDir: "build",
    sourcemap: true,
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/upload": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/bucket": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
    globals: true,
    clearMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{ts,tsx}", "server/**/*.ts"],
      exclude: ["**/*.mock.{ts,tsx}", "**/*.test.{ts,tsx}", "**/setupTests.ts"],
    },
  },
});
