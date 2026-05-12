import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { Auth } from "blaise-login-react-server";
import { defineFeature, loadFeature, setJestCucumberConfiguration } from "jest-cucumber";
import supertest, { type Response } from "supertest";
import { afterEach, describe, expect, vi, test as vitestTest } from "vitest";

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
import { getConfigFromEnv } from "../config";
import { newServer } from "../server";

Auth.prototype.ValidateToken = vi.fn().mockReturnValue(true);

vi.mock("blaise-iap-node-provider");

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });
const jsonHeaders = { "content-type": "application/json" };

const config = getConfigFromEnv();
const request = supertest(newServer(config));

const feature = loadFeature("./src/client/features/set_telephone_operations_start_date.feature", {
  tagFilter: "@server",
});

setJestCucumberConfiguration({
  runner: {
    describe,
    test: vitestTest,
  },
});

defineFeature(feature, (test) => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mock.reset();
  });

  test("Overwrite questionnaire and previous TO Start Date with new", ({ given, when, then }) => {
    let response: Response;

    given("a pre-deployed questionnaire that already has a TO Start Date stored against it", () => {
      mock
        .onGet(/\/tostartdate\/OPN2004A$/)
        .reply(200, { tostartdate: "2021-07-29T00:00:00+00:00" }, jsonHeaders);
      mock.onPatch(/\/tostartdate\/OPN2004A$/).reply(200, [], jsonHeaders);
    });

    when("a TO Start Date is specified", async () => {
      response = await request
        .post("/api/tostartdate/OPN2004A")
        .send({ tostartdate: "2020-06-05" });
    });

    then("the new TO Start Date will overwrite the previous", () => {
      expect(response.status).toEqual(201);
    });
  });

  test("Overwrite questionnaire and remove previous TO Start Date", ({ given, when, then }) => {
    let response: Response;

    given("a pre-deployed questionnaire that already has a TO Start Date stored against it", () => {
      mock
        .onGet(/\/tostartdate\/OPN2004A$/)
        .reply(200, { tostartdate: "2021-07-29T00:00:00+00:00" }, jsonHeaders);
      mock.onDelete(/\/tostartdate\/OPN2004A$/).reply(204, [], jsonHeaders);
    });

    when("a TO Start Date is not specified", async () => {
      response = await request.post("/api/tostartdate/OPN2004A").send({ tostartdate: "" });
    });

    then("the original TO Start Date is removed from data store", () => {
      expect(response.status).toEqual(201);
    });
  });
});
