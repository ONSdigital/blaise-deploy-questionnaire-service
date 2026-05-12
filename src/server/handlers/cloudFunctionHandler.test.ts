import express from "express";
import pino from "pino";
import supertest from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getConfigFromEnv } from "../config";
import { callCloudFunction } from "../helpers/cloudFunctionCallerHelper";
import createLogger from "../pinoLogger";
import { newServer } from "../server";

import newCloudFunctionHandler from "./cloudFunctionHandler";

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
  const { mockLoginReactServerModule } = await import("../test-utils/loginReactServer.mock");

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

  it("should return a 200 status and a json object with message and status if successfully created donor cases", async () => {
    callCloudFunctionToCreateDonorCasesMock.mockResolvedValue(successResponse);

    const response = await request.post("/api/cloudFunction/createDonorCases");

    expect(response.status).toEqual(200);
    expect(response.body).toEqual(successResponse);
  });

  it("should return a 500 status and a json object with message and status if cloud function failed creating donor cases", async () => {
    callCloudFunctionToCreateDonorCasesMock.mockRejectedValue(cloudFunctionAxiosError);

    const response = await request.post("/api/cloudFunction/createDonorCases");

    expect(response.status).toEqual(500);
    expect(response.body.message).toEqual(cloudFunctionAxiosError.response?.data);
  });

  it("should audit-log creating donor cases on success", async () => {
    callCloudFunctionToCreateDonorCasesMock.mockResolvedValue(successResponse);

    await request.post("/api/cloudFunction/createDonorCases").send(createDonorCasesPayload);

    expect(logInfo).toHaveBeenCalledWith(
      "AUDIT_LOG: Successfully created donor cases for questionnaire OPN2004A for role interviewer by rich",
    );
  });

  it("should audit-log creating donor cases on failure", async () => {
    callCloudFunctionToCreateDonorCasesMock.mockRejectedValue(cloudFunctionAxiosError);

    await request.post("/api/cloudFunction/createDonorCases").send(createDonorCasesPayload);

    expect(logError).toHaveBeenCalledWith(
      "AUDIT_LOG: Failed to create donor cases for questionnaire OPN2004A for role interviewer by rich",
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

  it("should return a 200 status and a json object with message and status if successfully reissued new donor case", async () => {
    callCloudFunctionToCreateDonorCasesMock.mockResolvedValue(successResponse);

    const response = await request.post("/api/cloudFunction/reissueNewDonorCase");

    expect(response.status).toEqual(200);
    expect(response.body).toEqual(successResponse);
  });

  it("should return a 500 status and a json object with message and status if cloud function failed reissuing new donor case", async () => {
    callCloudFunctionToCreateDonorCasesMock.mockRejectedValue(cloudFunctionAxiosError);

    const response = await request.post("/api/cloudFunction/reissueNewDonorCase");

    expect(response.status).toEqual(500);
    expect(response.body.message).toEqual(cloudFunctionAxiosError.response?.data);
  });

  it("should audit-log reissuing new donor case on success", async () => {
    callCloudFunctionToCreateDonorCasesMock.mockResolvedValue(successResponse);

    await request.post("/api/cloudFunction/reissueNewDonorCase").send(reissueDonorCasePayload);

    expect(logInfo).toHaveBeenCalledWith(
      "AUDIT_LOG: Successfully reissued new donor case for questionnaire OPN2004A for user alex by rich",
    );
  });

  it("should audit-log reissuing new donor case on failure", async () => {
    callCloudFunctionToCreateDonorCasesMock.mockRejectedValue(cloudFunctionAxiosError);

    await request.post("/api/cloudFunction/reissueNewDonorCase").send(reissueDonorCasePayload);

    expect(logError).toHaveBeenCalledWith(
      "AUDIT_LOG: Failed to reissue new donor case for questionnaire OPN2004A for user alex by rich",
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
