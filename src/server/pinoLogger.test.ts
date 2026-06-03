import { type HttpLogger } from "pino-http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockPinoHttp = vi.fn();

vi.mock("pino-http", () => ({
  pinoHttp: (config: unknown) => {
    mockPinoHttp(config);

    return {} as HttpLogger;
  },
}));

describe("createLogger", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.resetModules();
  });

  it("calls pinoHttp with the default autoLogging option in non-production", async () => {
    process.env.NODE_ENV = "test";
    const { default: createLogger } = await import("./pinoLogger.js");

    createLogger();

    expect(mockPinoHttp).toHaveBeenCalledWith({ autoLogging: false });
  });

  it("accepts custom options and merges them in non-production", async () => {
    process.env.NODE_ENV = "test";
    const { default: createLogger } = await import("./pinoLogger.js");

    createLogger({ autoLogging: true });

    expect(mockPinoHttp).toHaveBeenCalledWith({ autoLogging: true });
  });

  it("merges defaultPinoConf into options in production", async () => {
    process.env.NODE_ENV = "production";
    const { default: createLogger } = await import("./pinoLogger.js");

    createLogger();

    const [config] = mockPinoHttp.mock.calls[0] as [Record<string, unknown>];

    expect(config.messageKey).toBe("message");
    expect(config.autoLogging).toBe(false);
    expect(typeof config.formatters).toBe("object");
    expect(typeof config.serializers).toBe("object");
  });

  describe("formatters.level (production)", () => {
    async function getFormatters() {
      process.env.NODE_ENV = "production";
      const { default: createLogger } = await import("./pinoLogger.js");

      createLogger();
      const [config] = mockPinoHttp.mock.calls[0] as [
        {
          formatters: {
            level: (label: string, number: number) => unknown;
            log: (info: never) => unknown;
          };
        },
      ];

      return config.formatters;
    }

    it("maps trace to DEBUG", async () => {
      const { level } = await getFormatters();

      expect(level("trace", 10)).toEqual({ severity: "DEBUG", level: 10 });
    });

    it("maps debug to DEBUG", async () => {
      const { level } = await getFormatters();

      expect(level("debug", 20)).toEqual({ severity: "DEBUG", level: 20 });
    });

    it("maps info to INFO", async () => {
      const { level } = await getFormatters();

      expect(level("info", 30)).toEqual({ severity: "INFO", level: 30 });
    });

    it("maps warn to WARNING", async () => {
      const { level } = await getFormatters();

      expect(level("warn", 40)).toEqual({ severity: "WARNING", level: 40 });
    });

    it("maps error to ERROR", async () => {
      const { level } = await getFormatters();

      expect(level("error", 50)).toEqual({ severity: "ERROR", level: 50 });
    });

    it("maps fatal to CRITICAL", async () => {
      const { level } = await getFormatters();

      expect(level("fatal", 60)).toEqual({ severity: "CRITICAL", level: 60 });
    });

    it("falls back to INFO severity for unknown labels", async () => {
      const { level } = await getFormatters();

      expect(level("unknown", 99)).toEqual({ severity: "INFO", level: 99 });
    });

    it("wraps log info in an info property", async () => {
      const { log } = await getFormatters();
      const data = { foo: "bar" } as never;

      expect(log(data)).toEqual({ info: data });
    });
  });

  describe("serializers.req (production)", () => {
    async function getReqSerializer() {
      process.env.NODE_ENV = "production";
      const { default: createLogger } = await import("./pinoLogger.js");

      createLogger();
      const [config] = mockPinoHttp.mock.calls[0] as [
        {
          serializers: {
            req: (req: { method: string; url: string; raw: { user: unknown } }) => unknown;
          };
        },
      ];

      return config.serializers.req;
    }

    it("serializes method, url, and user from req", async () => {
      const req = await getReqSerializer();
      const result = req({ method: "GET", url: "/test", raw: { user: "alice" } });

      expect(result).toEqual({ method: "GET", url: "/test", user: "alice" });
    });
  });
});
