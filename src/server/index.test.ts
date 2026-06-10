import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const { mockInfo, mockError, mockDotenvConfig, mockListen, captureErrorHandler } = vi.hoisted(
  () => {
    const info = vi.fn();
    const error = vi.fn();
    const dotenvConfig = vi.fn();
    let errorHandler: ((err: Error) => void) | undefined;

    const listen = vi.fn((_port: number, callback: () => void) => {
      callback();

      return {
        on: (event: string, handler: (err: Error) => void) => {
          if (event === "error") {
            errorHandler = handler;
          }

          return {
            on: () => undefined,
          };
        },
      };
    });

    return {
      mockInfo: info,
      mockError: error,
      mockDotenvConfig: dotenvConfig,
      mockListen: listen,
      captureErrorHandler: () => errorHandler,
    };
  },
);

vi.mock("./config.js", () => ({
  getConfigFromEnv: () => ({
    port: 5000,
  }),
}));

vi.mock("./pinoLogger.js", () => ({
  default: () => ({
    logger: {
      info: mockInfo,
      error: mockError,
    },
  }),
}));

vi.mock("./server.js", () => ({
  newServer: () => ({
    listen: mockListen,
  }),
}));

vi.mock("dotenv", () => ({
  default: { config: mockDotenvConfig },
  config: mockDotenvConfig,
}));

describe("server index bootstrap", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env.NODE_ENV = "test";
  });

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("loads dotenv in non-production", async () => {
    await import("./index.js");

    expect(mockDotenvConfig).toHaveBeenCalledTimes(1);
  });

  it("does not load dotenv in production", async () => {
    process.env.NODE_ENV = "production";

    await import("./index.js");

    expect(mockDotenvConfig).not.toHaveBeenCalled();
  });

  it("logs startup message when server starts", async () => {
    await import("./index.js");

    expect(mockListen).toHaveBeenCalledWith(5000, expect.any(Function));
    expect(mockInfo).toHaveBeenCalledWith("App is listening on port 5000");
  });

  it("logs startup error and exits when server emits error", async () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation((() => undefined) as never);

    await import("./index.js");

    const handler = captureErrorHandler();
    const err = new Error("bind failed");

    handler?.(err);

    expect(mockError).toHaveBeenCalledWith(err, "Failed to start server");
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
  });
});
