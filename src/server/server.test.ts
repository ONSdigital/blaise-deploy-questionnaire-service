/// <reference types="vitest/globals" />

import fs from "fs";

const { mockGetQuestionnaires } = vi.hoisted(() => ({
  mockGetQuestionnaires: vi.fn(),
}));

vi.mock("blaise-api-node-client", () => ({
  BlaiseApiClient: class MockBlaiseApiClient {
    constructor(_url?: string) {}

    public getQuestionnaires = mockGetQuestionnaires;
  },
  default: class MockBlaiseApiClient {
    constructor(_url?: string) {}

    public getQuestionnaires = mockGetQuestionnaires;
  },
}));
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
  const { mockLoginReactServerModule } = await import("./test-utils/loginReactServer.mock.js");

  return mockLoginReactServerModule();
});
vi.mock("./helpers/cloudFunctionCallerHelper", () => ({
  callCloudFunction: vi.fn(),
}));
import { Auth } from "blaise-login-react-server";
import supertest from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getConfigFromEnv } from "./config.js";
import { callCloudFunction } from "./helpers/cloudFunctionCallerHelper.js";
import { newServer } from "./server.js";

Auth.prototype.ValidateToken = vi.fn().mockReturnValue(true);

const config = getConfigFromEnv();
const request = supertest(newServer(config));
const mockedCallCloudFunction = vi.mocked(callCloudFunction);

describe("Test Health Endpoint", () => {
  it("should return a 200 status and json message", async () => {
    const response = await request.get("/dqs-ui/version/health");

    expect(response.statusCode).toEqual(200);
    expect(response.body).toStrictEqual({ healthy: true });
  });
});

describe("Given the API returns 2 questionnaires", () => {
  beforeEach(() => {
    mockGetQuestionnaires.mockImplementation(() => {
      return Promise.resolve(apQuestionnaireList);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  const apQuestionnaireList = [
    {
      installDate: "2020-12-11T11:53:55.5612856+00:00",
      name: "OPN2007T",
      serverParkName: "LocalDevelopment",
    },
    {
      installDate: "2020-12-11T11:53:55.5612856+00:00",
      name: "OPN2004A",
      serverParkName: "LocalDevelopment",
    },
  ];

  const apiReturnedQuestionnaireList = [
    {
      installDate: "2020-12-11T11:53:55.5612856+00:00",
      name: "OPN2007T",
      serverParkName: "LocalDevelopment",
      fieldPeriod: "July 2020",
    },
    {
      installDate: "2020-12-11T11:53:55.5612856+00:00",
      name: "OPN2004A",
      serverParkName: "LocalDevelopment",
      fieldPeriod: "April 2020",
    },
  ];

  it("should return a 200 status and a list with the two", async () => {
    const response = await request.get("/api/questionnaires");

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveLength(2);
    expect(response.body).toStrictEqual(apiReturnedQuestionnaireList);
  });
});

describe("Get list of questionnaires endpoint fails", () => {
  beforeEach(() => {
    mockGetQuestionnaires.mockImplementation(() => {
      return Promise.reject("Network error");
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("should return a 500 status and an error message", async () => {
    const response = await request.get("/api/questionnaires");

    expect(response.statusCode).toEqual(500);
  });
});

describe("Unknown API endpoint", () => {
  it("should return a 404 status and not-found message", async () => {
    const response = await request.get("/api/does-not-exist");

    expect(response.statusCode).toEqual(404);
    expect(response.body).toStrictEqual({ message: "Not found" });
  });
});

describe("Cloud function routes build audit messages", () => {
  beforeEach(() => {
    mockedCallCloudFunction.mockResolvedValue({ message: "Success", status: 200 });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("covers createDonorCases when questionnaire_name and role are strings", async () => {
    const response = await request.post("/api/cloudFunction/createDonorCases").send({
      questionnaire_name: "OPN2004A",
      role: "interviewer",
    });

    expect(response.statusCode).toEqual(200);
  });

  it("covers createDonorCases unknown fallbacks when payload is missing", async () => {
    const response = await request.post("/api/cloudFunction/createDonorCases").send({});

    expect(response.statusCode).toEqual(200);
  });

  it("covers reissueNewDonorCase user branch", async () => {
    const response = await request.post("/api/cloudFunction/reissueNewDonorCase").send({
      questionnaire_name: "OPN2004A",
      user: "alex",
    });

    expect(response.statusCode).toEqual(200);
  });

  it("covers reissueNewDonorCase role fallback branch", async () => {
    const response = await request.post("/api/cloudFunction/reissueNewDonorCase").send({
      questionnaire_name: "OPN2004A",
      role: "interviewer",
    });

    expect(response.statusCode).toEqual(200);
  });

  it("covers reissueNewDonorCase unknown fallbacks", async () => {
    const response = await request.post("/api/cloudFunction/reissueNewDonorCase").send({});

    expect(response.statusCode).toEqual(200);
  });
});

describe("Client route rendering and global error handler", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the static 500 page when render fails and error page exists", async () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    const app = newServer(config);

    app.set("views", "/definitely/missing/views");

    const response = await supertest(app).get("/some/client/route");

    expect(response.statusCode).not.toEqual(200);
    expect(response.text).not.toEqual("Sorry, there is a problem with the service.");
  });

  it("returns plain text fallback when render fails and no error page exists", async () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(false);
    const app = newServer(config);

    app.set("views", "/definitely/missing/views");

    const response = await supertest(app).get("/another/client/route");

    expect(response.statusCode).toEqual(500);
    expect(response.text).toEqual("Sorry, there is a problem with the service.");
  });
});

describe("Server module bootstrap", () => {
  it("does not call dotenv.config when NODE_ENV is production", async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const dotenvConfig = vi.fn();

    vi.resetModules();
    process.env.NODE_ENV = "production";
    vi.doMock("dotenv", () => ({
      default: { config: dotenvConfig },
      config: dotenvConfig,
    }));

    await import("./server.js");

    expect(dotenvConfig).not.toHaveBeenCalled();

    vi.doUnmock("dotenv");
    process.env.NODE_ENV = originalNodeEnv;
  });
});
