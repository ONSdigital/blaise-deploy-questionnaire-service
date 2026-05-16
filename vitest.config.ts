import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    clearMocks: true,
    exclude: ["build/**", "coverage/**", "node_modules/**"],
    projects: [
      {
        test: {
          name: "client",
          globals: true,
          environment: "happy-dom",
          setupFiles: ["./src/client/setupTests.ts"],
          include: ["src/client/**/*.test.{ts,tsx}"],
        },
      },
      {
        test: {
          name: "server",
          globals: true,
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
      exclude: [
        "**/*.mock.{ts,tsx}",
        "**/*.test.{ts,tsx}",
        "**/*.types.ts",
        "**/setupTests.ts",
        "src/client/features/**",
        "src/client/test-utils/**",
      ],
    },
  },
});
