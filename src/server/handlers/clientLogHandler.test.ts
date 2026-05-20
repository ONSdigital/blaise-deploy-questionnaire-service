import { Auth } from "blaise-login-react-server";
import pino from "pino";
import { type HttpLogger, pinoHttp } from "pino-http";
import supertest, { type Response } from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getConfigFromEnv } from "../config.js";
import { newServer } from "../server.js";

vi.mock("blaise-uac-service-node-client", () => ({
  __esModule: true,
  BusClient: class MockBusClient {
    constructor(_url?: string, _clientId?: string) {}
  },
  default: class MockBusClient {
    constructor(_url?: string, _clientId?: string) {}
  },
}));
vi.mock("@google-cloud/logging", () => ({
  Logging: class MockLogging {
    constructor(_options?: unknown) {}

    public log(_logName: string) {
      return {
        getEntries: async () => [[]],
      };
    }
  },
}));
vi.mock("@google-cloud/storage", () => ({
  Storage: class MockStorage {
    constructor(_options?: unknown) {}

    public bucket(_bucketName: string) {
      return {
        file: (_fileName: string) => ({
          getSignedUrl: async () => [""],
          getMetadata: async () => [{}],
        }),
        getFiles: async () => [[]],
      };
    }
  },
}));
vi.mock("blaise-login-react-server", async () => {
  const { mockLoginReactServerModule } = await import("../test-utils/loginReactServer.mock.js");

  return mockLoginReactServerModule();
});
vi.mock("blaise-api-node-client", () => ({
  __esModule: true,
  BlaiseApiClient: class MockBlaiseApiClient {
    constructor(_url?: string) {}
  },
  default: class MockBlaiseApiClient {
    constructor(_url?: string) {}
  },
}));

Auth.prototype.validateToken = vi.fn().mockReturnValue(true);
Auth.prototype.getUser = vi.fn().mockReturnValue({ name: "rich" });
Auth.prototype.getToken = vi.fn().mockReturnValue("example-token");

vi.mock("blaise-iap-node-provider");

const logger: pino.Logger = pino();

logger.child = vi.fn(() => logger) as unknown as typeof logger.child;
const logInfo = vi.spyOn(logger, "info");
const logWarn = vi.spyOn(logger, "warn");
const logError = vi.spyOn(logger, "error");
const logDebug = vi.spyOn(logger, "debug");
const httpLogger: HttpLogger = pinoHttp({ logger: logger, autoLogging: false });

const config = getConfigFromEnv();
const request = supertest(newServer(config, httpLogger));

describe("Client log forwarding", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("accepts an info client log and writes it to server logs", async () => {
    const response: Response = await request
      .post("/api/client-log")
      .send({ level: "info", message: "hello from browser", args: ["extra"], pathname: "/audit" });

    expect(response.status).toEqual(204);
    expect(logInfo).toHaveBeenCalled();
    const lastCall = logInfo.mock.calls[logInfo.mock.calls.length - 1];

    expect(lastCall[1]).toEqual("CLIENT_LOG: hello from browser");
    expect(lastCall[0]).toHaveProperty("clientLog");
  });

  it("accepts warn/error levels and routes to the correct pino method", async () => {
    const warnRes: Response = await request
      .post("/api/client-log")
      .send({ level: "warn", message: "a warning" });

    expect(warnRes.status).toEqual(204);
    expect(logWarn).toHaveBeenCalled();

    const errRes: Response = await request
      .post("/api/client-log")
      .send({ level: "error", message: "an error" });

    expect(errRes.status).toEqual(204);
    expect(logError).toHaveBeenCalled();
  });

  it("rejects an invalid level", async () => {
    const response: Response = await request
      .post("/api/client-log")
      .send({ level: "verbose", message: "nope" });

    expect(response.status).toEqual(400);
    expect(logInfo).not.toHaveBeenCalled();
    expect(logWarn).not.toHaveBeenCalled();
    expect(logError).not.toHaveBeenCalled();
  });

  it("rejects missing level", async () => {
    const response: Response = await request.post("/api/client-log").send({ message: "hello" });

    expect(response.status).toEqual(400);
  });

  it("rejects missing level when request body is undefined", async () => {
    const response: Response = await request.post("/api/client-log");

    expect(response.status).toEqual(400);
  });

  it("rejects missing message", async () => {
    const response: Response = await request.post("/api/client-log").send({ level: "info" });

    expect(response.status).toEqual(400);
  });

  it("normalises level=log to info", async () => {
    const response: Response = await request
      .post("/api/client-log")
      .send({ level: "log", message: "hello" });

    expect(response.status).toEqual(204);
    expect(logInfo).toHaveBeenCalled();
  });

  it("accepts debug level", async () => {
    const response: Response = await request
      .post("/api/client-log")
      .send({ level: "debug", message: "dbg" });

    expect(response.status).toEqual(204);
    expect(logDebug).toHaveBeenCalled();
  });

  it("falls back to request user-agent when none provided", async () => {
    const response: Response = await request
      .post("/api/client-log")
      .set("user-agent", "test-agent")
      .send({ level: "info", message: "hello" });

    expect(response.status).toEqual(204);
    const lastCall = logInfo.mock.calls[logInfo.mock.calls.length - 1];
    const payload = lastCall[0] as unknown as { clientLog?: { userAgent?: string } };

    expect(payload.clientLog?.userAgent).toEqual("test-agent");
  });

  it("truncates oversized message payloads", async () => {
    const oversized = "x".repeat(2100);

    const response: Response = await request
      .post("/api/client-log")
      .send({ level: "info", message: oversized });

    expect(response.status).toEqual(204);
    const lastCall = logInfo.mock.calls[logInfo.mock.calls.length - 1];
    const payload = lastCall[0] as unknown as { clientLog?: { message?: string } };

    expect(payload.clientLog?.message?.length).toEqual(2000);
  });

  it("captures optional string metadata fields", async () => {
    const response: Response = await request.post("/api/client-log").send({
      level: "info",
      message: "hello",
      pathname: "/route",
      href: "https://example.com/route",
      userAgent: "custom-agent",
      timestamp: "2024-01-01T00:00:00.000Z",
      stack: "stacktrace",
    });

    expect(response.status).toEqual(204);
    const lastCall = logInfo.mock.calls[logInfo.mock.calls.length - 1];
    const payload = lastCall[0] as unknown as {
      clientLog?: {
        pathname?: string;
        href?: string;
        userAgent?: string;
        timestamp?: string;
        stack?: string;
      };
    };

    expect(payload.clientLog?.pathname).toEqual("/route");
    expect(payload.clientLog?.href).toEqual("https://example.com/route");
    expect(payload.clientLog?.userAgent).toEqual("custom-agent");
    expect(payload.clientLog?.timestamp).toEqual("2024-01-01T00:00:00.000Z");
    expect(payload.clientLog?.stack).toEqual("stacktrace");
  });
});
