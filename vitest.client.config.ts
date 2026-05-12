import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // Test-only alias: map the mock module id used in tests to the local auth mock implementation.
      "blaise-login-react/blaise-login-react-client": path.resolve(
        __dirname,
        "src/client/tests/utils/authenticate.mock.tsx",
      ),
    },
  },
  test: {
    globals: true,
    clearMocks: true,
    environment: "happy-dom",
    testTimeout: 20000,
    setupFiles: ["./src/client/setupTests.ts"],
    include: ["src/client/**/*.test.ts", "src/client/**/*.test.tsx"],
    exclude: ["src/server/**/*.test.ts", "src/server/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: [
        "**/*.mock.ts",
        "**/*.mock.tsx",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/setupTests.ts",
      ],
    },
  },
});
