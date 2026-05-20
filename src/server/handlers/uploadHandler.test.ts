import express from "express";
import supertest from "supertest";
import { describe, expect, it, vi } from "vitest";

import newUploadHandler from "./uploadHandler.js";

import type { Logger } from "pino";

type RequestWithLog = express.Request & {
  log: express.Request["log"];
};

type MockStorageManager = {
  bucketName: string;
  GetSignedUrl: ReturnType<typeof vi.fn>;
  GetBucketItems: ReturnType<typeof vi.fn>;
  CheckFile: ReturnType<typeof vi.fn>;
};

function createApp(storageManager: MockStorageManager) {
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
    middleware: (_req: express.Request, _res: express.Response, next: express.NextFunction) =>
      next(),
    getToken: vi.fn().mockReturnValue("test-token"),
    getUser: vi.fn().mockReturnValue({ name: "test-user" }),
  } as unknown as Parameters<typeof newUploadHandler>[1];
  const auditLogger = {
    info: vi.fn(),
    error: vi.fn(),
  };

  app.use(
    newUploadHandler(
      storageManager as unknown as Parameters<typeof newUploadHandler>[0],
      auth,
      auditLogger as unknown as Parameters<typeof newUploadHandler>[2],
    ),
  );

  return app;
}

describe("UploadHandler", () => {
  function newStorage(): MockStorageManager {
    return {
      bucketName: "test-bucket",
      GetSignedUrl: vi.fn(),
      GetBucketItems: vi.fn(),
      CheckFile: vi.fn(),
    };
  }

  it("returns 400 when upload init has no filename", async () => {
    const storage = newStorage();
    const response = await supertest(createApp(storage)).get("/upload/init");

    expect(response.status).toBe(400);
  });

  it("returns 400 when upload init filename is unsafe", async () => {
    const storage = newStorage();
    const response = await supertest(createApp(storage)).get("/upload/init?filename=../bad.bpkg");

    expect(response.status).toBe(400);
  });

  it("returns 500 when signed URL host is not allowed", async () => {
    const storage = newStorage();

    storage.GetSignedUrl.mockResolvedValue("https://example.com/upload");

    const response = await supertest(createApp(storage)).get("/upload/init?filename=good.bpkg");

    expect(response.status).toBe(500);
  });

  it("returns 500 when signed URL is malformed", async () => {
    const storage = newStorage();

    storage.GetSignedUrl.mockResolvedValue("not-a-valid-url");

    const response = await supertest(createApp(storage)).get("/upload/init?filename=good.bpkg");

    expect(response.status).toBe(500);
  });

  it("returns 500 when signed URL generation throws", async () => {
    const storage = newStorage();

    storage.GetSignedUrl.mockRejectedValue(new Error("signing failed"));

    const response = await supertest(createApp(storage)).get("/upload/init?filename=good.bpkg");

    expect(response.status).toBe(500);
  });

  it("returns 200 when upload init succeeds", async () => {
    const storage = newStorage();

    storage.GetSignedUrl.mockResolvedValue("https://storage.googleapis.com/upload");

    const response = await supertest(createApp(storage)).get("/upload/init?filename=good.bpkg");

    expect(response.status).toBe(200);
    expect(response.body).toBe("https://storage.googleapis.com/upload");
  });

  it("returns 200 for bucket file listing", async () => {
    const storage = newStorage();

    storage.GetBucketItems.mockResolvedValue(["a.bpkg"]);

    const response = await supertest(createApp(storage)).get("/bucket/files");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(["a.bpkg"]);
  });

  it("returns 500 when bucket file listing fails", async () => {
    const storage = newStorage();

    storage.GetBucketItems.mockRejectedValue(new Error("fail"));

    const response = await supertest(createApp(storage)).get("/bucket/files");

    expect(response.status).toBe(500);
  });

  it("returns 400 when verify has no filename", async () => {
    const storage = newStorage();
    const response = await supertest(createApp(storage)).get("/upload/verify");

    expect(response.status).toBe(400);
  });

  it("returns 400 when verify filename is unsafe", async () => {
    const storage = newStorage();
    const response = await supertest(createApp(storage)).get("/upload/verify?filename=../bad.bpkg");

    expect(response.status).toBe(400);
  });

  it("returns 404 when file is not found", async () => {
    const storage = newStorage();

    storage.CheckFile.mockResolvedValue({ found: false });

    const response = await supertest(createApp(storage)).get("/upload/verify?filename=good.bpkg");

    expect(response.status).toBe(404);
  });

  it("returns 200 when file is found", async () => {
    const storage = newStorage();

    storage.CheckFile.mockResolvedValue({ found: true, name: "good.bpkg", updated: "today" });

    const response = await supertest(createApp(storage)).get("/upload/verify?filename=good.bpkg");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ found: true, name: "good.bpkg", updated: "today" });
  });

  it("returns 500 when verify throws unexpectedly", async () => {
    const storage = newStorage();

    storage.CheckFile.mockRejectedValue(new Error("boom"));

    const response = await supertest(createApp(storage)).get("/upload/verify?filename=good.bpkg");

    expect(response.status).toBe(500);
  });
});
