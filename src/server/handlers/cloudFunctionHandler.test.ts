/**
 * @vitest-environment node
 */
// it.skip("placeholder", () => { });

import supertest from "supertest";

import { cloudFunctionAxiosError } from "../../features/step_definitions/helpers/apiMockObjects";
import { getConfigFromEnv } from "../config";
import { callCloudFunction } from "../helpers/cloudFunctionCallerHelper";
import createLogger from "../pino";
import { newServer } from "../server";

vi.mock("blaise-uac-service-node-client", () => ({
  __esModule: true,
  default: class MockBusClient {
    constructor(_url?: string, _clientId?: string) {
      // Intentionally empty for tests.
    }
  },
}));
vi.mock("@google-cloud/logging", () => ({
  Logging: class MockLogging {
    constructor(_options?: unknown) {
      // Intentionally empty for tests.
    }

    public log(_logName: string) {
      return {
        getEntries: async () => [[]],
      };
    }
  },
}));
vi.mock("@google-cloud/storage", () => ({
  Storage: class MockStorage {
    constructor(_options?: unknown) {
      // Intentionally empty for tests.
    }

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
  const { mockLoginReactServerModule } = await import("../../tests/utils/mockLoginReactServer");

  return mockLoginReactServerModule();
});
vi.mock("../helpers/cloudFunctionCallerHelper");
const successResponse = {
  message: "Success",
  status: 200,
};

const config = getConfigFromEnv();
const callCloudFunctionToCreateDonorCasesMock = vi.mocked(callCloudFunction);

describe("Call Cloud Function to create donor cases and return responses", () => {
  let request: supertest.SuperTest<supertest.Test>;

  beforeEach(() => {
    request = supertest(newServer(config, createLogger()));
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
    expect(response.body.message).toEqual((cloudFunctionAxiosError as unknown).response.data);
  });
});
