import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { Auth } from "blaise-login-react-server";
import supertest, { type Response } from "supertest";
import { afterAll, afterEach, describe, expect, test, vi } from "vitest";

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

import { getConfigFromEnv } from "../config.js";
import { newServer } from "../server.js";

Auth.prototype.validateToken = vi.fn().mockReturnValue(true);
Auth.prototype.getUser = vi.fn().mockReturnValue({ name: "rich" });
Auth.prototype.getToken = vi.fn().mockReturnValue("example-token");

vi.mock("blaise-iap-node-provider", () => ({
  IapProvider: class MockIapProvider {
    constructor(_clientId?: string) {}

    async getAuthHeader(): Promise<Record<string, never>> {
      return {};
    }
  },
}));

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });
const jsonHeaders = { "content-type": "application/json" };

vi.spyOn(axios, "create").mockReturnValue(axios);

const config = getConfigFromEnv();
const request = supertest(newServer(config));

describe("setToStartDate", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.resetModules();
    mock.reset();
  });

  describe.sequential(
    "Scenario: Overwrite questionnaire and previous Telephone Operations start date with a new value",
    () => {
      let response: Response;

      test("Given a pre-deployed questionnaire that already has a Telephone Operations start date stored against it", () => {
        mock
          .onGet(`${config.BimsApiUrl}/tostartdate/OPN2004A`)
          .reply(200, { tostartdate: "2021-07-29T00:00:00+00:00" }, jsonHeaders);
        mock
          .onPatch(`${config.BimsApiUrl}/tostartdate/OPN2004A`)
          .reply(200, { tostartdate: "2020-06-05T00:00:00+00:00" }, jsonHeaders);
        mock
          .onPost(`${config.BimsApiUrl}/tostartdate/OPN2004A`)
          .reply(201, { tostartdate: "2020-06-05T00:00:00+00:00" }, jsonHeaders);
      });

      test("When a Telephone Operations start date is specified", async () => {
        response = await request
          .post("/api/tostartdate/OPN2004A")
          .send({ tostartdate: "2020-06-05" });
      });

      test("Then the new Telephone Operations start date will overwrite the previous value", () => {
        expect(response.status).toEqual(201);
      });
    },
  );

  describe.sequential(
    "Scenario: Overwrite questionnaire and delete previous Telephone Operations start date",
    () => {
      let response: Response;

      test("Given a pre-deployed questionnaire that already has a Telephone Operations start date stored against it", () => {
        mock
          .onGet(`${config.BimsApiUrl}/tostartdate/OPN2004A`)
          .reply(200, { tostartdate: "2021-07-29T00:00:00+00:00" }, jsonHeaders);
        mock.onDelete(`${config.BimsApiUrl}/tostartdate/OPN2004A`).reply(204, [], jsonHeaders);
        mock
          .onPost(`${config.BimsApiUrl}/tostartdate/OPN2004A`)
          .reply(201, { tostartdate: "" }, jsonHeaders);
      });

      test("When a Telephone Operations start date is not specified", async () => {
        response = await request.post("/api/tostartdate/OPN2004A").send({ tostartdate: "" });
      });

      test("Then the original Telephone Operations start date is deleted from data store", () => {
        expect(response.status).toEqual(201);
      });
    },
  );
});
