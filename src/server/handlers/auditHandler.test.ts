import express from "express";
import supertest from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import newAuditHandler from "./auditHandler";

import type { Logger } from "pino";

type MockAuditLogger = {
  getLogs: ReturnType<typeof vi.fn>;
};

type RequestWithLog = express.Request & {
  log: express.Request["log"];
};

function createApp(auditLogger: MockAuditLogger) {
  const app = express();

  app.use((req, _res, next) => {
    (req as RequestWithLog).log = {
      info: vi.fn() as unknown as Logger["info"],
      error: vi.fn() as unknown as Logger["error"],
    } as unknown as express.Request["log"];
    next();
  });

  app.use(newAuditHandler(auditLogger as unknown as Parameters<typeof newAuditHandler>[0]));

  return app;
}

describe("AuditHandler", () => {
  let auditLogger: MockAuditLogger;

  beforeEach(() => {
    vi.clearAllMocks();
    auditLogger = { getLogs: vi.fn() };
  });

  it("returns 200 with audit logs on success", async () => {
    const logs = [{ id: "1", timestamp: "2024-01-01", message: "did something", severity: "INFO" }];

    auditLogger.getLogs.mockResolvedValueOnce(logs);

    const response = await supertest(createApp(auditLogger)).get("/api/audit");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(logs);
  });

  it("returns 500 with error body when getLogs throws", async () => {
    const error = { message: "cloud error" };

    auditLogger.getLogs.mockRejectedValueOnce(error);

    const response = await supertest(createApp(auditLogger)).get("/api/audit");

    expect(response.status).toBe(500);
  });
});
