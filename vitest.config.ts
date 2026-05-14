import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    clearMocks: true,
    exclude: ["build/**", "coverage/**", "node_modules/**"],
    projects: [
      {
        extends: true,
        test: {
          name: "client",
          environment: "happy-dom",
          setupFiles: ["./src/client/setupTests.ts"],
          include: ["src/client/**/*.test.{ts,tsx}"],
        },
      },
      {
        extends: true,
        test: {
          name: "server",
          environment: "node",
          setupFiles: ["./src/server/setupTests.ts"],
          include: ["src/server/**/*.test.ts"],
        },
      },
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["**/*.mock.{ts,tsx}", "**/*.test.{ts,tsx}", "**/*.types.ts", "**/setupTests.ts"],
    },
  },
});
