import express from "express";
import supertest from "supertest";
import { describe, expect, it, vi } from "vitest";

import newBusHandler, { type BusClientLike } from "./busHandler";

import type { Logger } from "pino";

type RequestWithLog = express.Request & {
  log: express.Request["log"];
};

function createApp(busClient: BusClientLike) {
  const app = express();

  app.use((req, _res, next) => {
    (req as RequestWithLog).log = {
      info: vi.fn() as unknown as Logger["info"],
      error: vi.fn() as unknown as Logger["error"],
      warn: vi.fn() as unknown as Logger["warn"],
    } as unknown as express.Request["log"];
    next();
  });

  const auth = {
    Middleware: (_req: express.Request, _res: express.Response, next: express.NextFunction) =>
      next(),
  } as unknown as Parameters<typeof newBusHandler>[1];

  app.use(newBusHandler(busClient, auth));

  return app;
}

describe("BusHandler", () => {
  it("returns 200 for generate UACs success", async () => {
    const busClient: BusClientLike = {
      generateUacsForQuestionnaire: vi.fn().mockResolvedValue({ count: 2 }),
      getUacsByCaseId: vi.fn(),
      getUacCount: vi.fn(),
    };

    const response = await supertest(createApp(busClient)).post("/api/uacs/instrument/OPN2004A");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ count: 2 });
  });

  it("returns 500 for generate UACs non-object response", async () => {
    const busClient: BusClientLike = {
      generateUacsForQuestionnaire: vi.fn().mockResolvedValue("bad"),
      getUacsByCaseId: vi.fn(),
      getUacCount: vi.fn(),
    };

    const response = await supertest(createApp(busClient)).post("/api/uacs/instrument/OPN2004A");

    expect(response.status).toBe(500);
  });

  it("returns 200 for get UACs by case ID success", async () => {
    const busClient: BusClientLike = {
      generateUacsForQuestionnaire: vi.fn(),
      getUacsByCaseId: vi.fn().mockResolvedValue({ CASE1: "uac" }),
      getUacCount: vi.fn(),
    };

    const response = await supertest(createApp(busClient)).get(
      "/api/uacs/instrument/OPN2004A/bycaseid",
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ CASE1: "uac" });
  });

  it("returns 500 for get UACs by case ID non-object response", async () => {
    const busClient: BusClientLike = {
      generateUacsForQuestionnaire: vi.fn(),
      getUacsByCaseId: vi.fn().mockResolvedValue(undefined),
      getUacCount: vi.fn(),
    };

    const response = await supertest(createApp(busClient)).get(
      "/api/uacs/instrument/OPN2004A/bycaseid",
    );

    expect(response.status).toBe(500);
  });

  it("returns 200 for get UAC count success", async () => {
    const busClient: BusClientLike = {
      generateUacsForQuestionnaire: vi.fn(),
      getUacsByCaseId: vi.fn(),
      getUacCount: vi.fn().mockResolvedValue({ count: 6 }),
    };

    const response = await supertest(createApp(busClient)).get(
      "/api/uacs/instrument/OPN2004A/count",
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ count: 6 });
  });

  it("returns 500 for get UAC count invalid response", async () => {
    const busClient: BusClientLike = {
      generateUacsForQuestionnaire: vi.fn(),
      getUacsByCaseId: vi.fn(),
      getUacCount: vi.fn().mockResolvedValue({ count: "bad" }),
    };

    const response = await supertest(createApp(busClient)).get(
      "/api/uacs/instrument/OPN2004A/count",
    );

    expect(response.status).toBe(500);
  });
});
