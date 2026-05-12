import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    clearMocks: true,
    environment: "node",
    include: ["src/server/**/*.test.ts", "src/server/**/*.test.tsx"],
  },
});
