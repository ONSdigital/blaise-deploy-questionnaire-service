import path from "node:path";
import { fileURLToPath } from "node:url";

// Recreate __dirname for standard Node ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  // 1. React Frontend Testing Environment
  {
    resolve: {
      alias: {
        "blaise-login-react/blaise-login-react-client": path.resolve(
          __dirname,
          "src/client/tests/utils/authenticate.mock.tsx",
        ),
      },
    },
    test: {
      name: "client",
      environment: "happy-dom",
      setupFiles: ["./src/client/setupTests.ts"],
      include: ["src/client/**/*.test.{ts,tsx}", "src/components/**/*.test.{ts,tsx}"],
      exclude: ["src/server/**/*.test.ts"],
      globals: true,
      clearMocks: true,
    },
  },
  // 2. Node Backend Testing Environment
  {
    test: {
      name: "server",
      environment: "node",
      include: ["src/server/**/*.test.ts"],
      globals: true,
      clearMocks: true,
    },
  },
];
