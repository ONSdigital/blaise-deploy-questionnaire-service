import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockInfo, mockError, mockListen, captureErrorHandler } = vi.hoisted(() => {
  const info = vi.fn();
  const error = vi.fn();
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
    mockListen: listen,
    captureErrorHandler: () => errorHandler,
  };
});

vi.mock("./config.js", () => ({
  getConfigFromEnv: () => ({
    Port: 5000,
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

describe("server index bootstrap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
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
