import express from "express";
import pino from "pino";
import supertest from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getConfigFromEnv } from "../config.js";
import { callCloudFunction } from "../helpers/cloudFunctionCallerHelper.js";
import createLogger from "../pinoLogger.js";
import { newServer } from "../server.js";

import newCloudFunctionHandler from "./cloudFunctionHandler.js";

import type { Logger } from "pino";

type RequestWithLog = express.Request & {
  log: express.Request["log"];
};

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
vi.mock("../helpers/cloudFunctionCallerHelper");
const successResponse = {
  message: "Success",
  status: 200,
};
const cloudFunctionAxiosError = {
  response: {
    status: 500,
    data: "Error invoking cloud function",
  },
};

const config = getConfigFromEnv();
const callCloudFunctionToCreateDonorCasesMock = vi.mocked(callCloudFunction);
const logger: pino.Logger = pino();
const logInfo = vi.spyOn(logger, "info");
const logError = vi.spyOn(logger, "error");
const createDonorCasesPayload = { questionnaire_name: "OPN2004A", role: "interviewer" };
const reissueDonorCasePayload = { questionnaire_name: "OPN2004A", user: "alex" };

describe("Call Cloud Function to create donor cases and return responses", () => {
  let request: supertest.Agent;

  beforeEach(() => {
    request = supertest(newServer(config, createLogger({ logger: logger })));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return a 200 status and a JSON response body with message and status when donor cases are created successfully", async () => {
    callCloudFunctionToCreateDonorCasesMock.mockResolvedValue(successResponse);

    const response = await request.post("/api/cloudFunction/createDonorCases");

    expect(response.status).toEqual(200);
    expect(response.body).toEqual(successResponse);
  });

  it("should return a 500 status and a JSON response body with message and status when creating donor cases fails", async () => {
    callCloudFunctionToCreateDonorCasesMock.mockRejectedValue(cloudFunctionAxiosError);

    const response = await request.post("/api/cloudFunction/createDonorCases");

    expect(response.status).toEqual(500);
    expect(response.body.message).toEqual(cloudFunctionAxiosError.response?.data);
  });

  it("should audit-log creating donor cases on success", async () => {
    callCloudFunctionToCreateDonorCasesMock.mockResolvedValue(successResponse);

    await request.post("/api/cloudFunction/createDonorCases").send(createDonorCasesPayload);

    expect(logInfo).toHaveBeenCalledWith(
      "AUDIT_LOG: rich created donor cases for interviewer on OPN2004A",
    );
  });

  it("should audit-log creating donor cases on failure", async () => {
    callCloudFunctionToCreateDonorCasesMock.mockRejectedValue(cloudFunctionAxiosError);

    await request.post("/api/cloudFunction/createDonorCases").send(createDonorCasesPayload);

    expect(logError).toHaveBeenCalledWith(
      "AUDIT_LOG: rich failed to create donor cases for interviewer on OPN2004A",
    );
  });
});

describe("Call Cloud Function to reissue new donor case and return responses", () => {
  let request: supertest.Agent;

  beforeEach(() => {
    request = supertest(newServer(config, createLogger({ logger: logger })));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return a 200 status and a JSON response body with message and status when reissuing a donor case succeeds", async () => {
    callCloudFunctionToCreateDonorCasesMock.mockResolvedValue(successResponse);

    const response = await request.post("/api/cloudFunction/reissueNewDonorCase");

    expect(response.status).toEqual(200);
    expect(response.body).toEqual(successResponse);
  });

  it("should return a 500 status and a JSON response body with message and status when reissuing a donor case fails", async () => {
    callCloudFunctionToCreateDonorCasesMock.mockRejectedValue(cloudFunctionAxiosError);

    const response = await request.post("/api/cloudFunction/reissueNewDonorCase");

    expect(response.status).toEqual(500);
    expect(response.body.message).toEqual(cloudFunctionAxiosError.response?.data);
  });

  it("should audit-log reissuing new donor case on success", async () => {
    callCloudFunctionToCreateDonorCasesMock.mockResolvedValue(successResponse);

    await request.post("/api/cloudFunction/reissueNewDonorCase").send(reissueDonorCasePayload);

    expect(logInfo).toHaveBeenCalledWith(
      "AUDIT_LOG: rich reissued donor case for alex on OPN2004A",
    );
  });

  it("should audit-log reissuing new donor case on failure", async () => {
    callCloudFunctionToCreateDonorCasesMock.mockRejectedValue(cloudFunctionAxiosError);

    await request.post("/api/cloudFunction/reissueNewDonorCase").send(reissueDonorCasePayload);

    expect(logError).toHaveBeenCalledWith(
      "AUDIT_LOG: rich failed to reissue donor case for alex on OPN2004A",
    );
  });
});

describe("CloudFunctionHandler without audit dependencies", () => {
  it("returns success without attempting audit logging when audit deps are not provided", async () => {
    callCloudFunctionToCreateDonorCasesMock.mockResolvedValue(successResponse);

    const app = express();

    app.use(express.json());
    app.use((req, _res, next) => {
      (req as RequestWithLog).log = {
        info: vi.fn() as unknown as Logger["info"],
        error: vi.fn() as unknown as Logger["error"],
        warn: vi.fn() as unknown as Logger["warn"],
      } as unknown as express.Request["log"];
      next();
    });
    app.use(newCloudFunctionHandler("/api/cloud/no-audit", "https://example.com/cf"));

    const response = await supertest(app).post("/api/cloud/no-audit").send({ a: 1 });

    expect(response.status).toEqual(200);
    expect(response.body).toEqual(successResponse);
  });

  it("returns 500 without attempting audit logging when audit deps are not provided", async () => {
    callCloudFunctionToCreateDonorCasesMock.mockRejectedValue(cloudFunctionAxiosError);

    const app = express();

    app.use(express.json());
    app.use((req, _res, next) => {
      (req as RequestWithLog).log = {
        info: vi.fn() as unknown as Logger["info"],
        error: vi.fn() as unknown as Logger["error"],
        warn: vi.fn() as unknown as Logger["warn"],
      } as unknown as express.Request["log"];
      next();
    });
    app.use(newCloudFunctionHandler("/api/cloud/no-audit", "https://example.com/cf"));

    const response = await supertest(app).post("/api/cloud/no-audit").send({ a: 1 });

    expect(response.status).toEqual(500);
    expect(response.body.message).toEqual(cloudFunctionAxiosError.response.data);
  });
});
