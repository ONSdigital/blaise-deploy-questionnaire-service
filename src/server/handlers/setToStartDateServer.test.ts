/* eslint-disable import-x/order */
/**
 * @vitest-environment node
 */
import { newServer } from "../server";

import supertest, { type Response } from "supertest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { defineFeature, loadFeature } from "jest-cucumber";

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
import { Auth } from "blaise-login-react-server";

import { getConfigFromEnv } from "../config";

Auth.prototype.ValidateToken = vi.fn().mockReturnValue(true);

vi.mock("blaise-iap-node-provider");

// Create Mock adapter for Axios requests
const mock = new MockAdapter(axios, { onNoMatch: "throwException" });
const jsonHeaders = { "content-type": "application/json" };

// Mock Express Server
const config = getConfigFromEnv();
const request = supertest(newServer(config));

const feature = loadFeature("./src/features/set_telephone_operations_start_date.feature", {
  tagFilter: "@server",
});

/**
 * These scenarios don't really work as unit tests,
 * but they work as a decent structure to unit test the BimsAPI requests in the node.js server.
 */
defineFeature(feature, (test) => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mock.reset();
  });

  test("Overwrite questionnaire and previous TO Start Date with new", ({ given, when, then }) => {
    let response: Response;

    given("a pre-deployed questionnaire that already has a TO Start Date stored against it", () => {
      // Mock BIMS already having a live date stored
      mock
        .onGet(/\/tostartdate\/OPN2004A$/)
        .reply(200, { tostartdate: "2021-07-29T00:00:00+00:00" }, jsonHeaders);
      // Mock BIMS storing updated date
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
      // Mock BIMS already having a live date stored
      mock
        .onGet(/\/tostartdate\/OPN2004A$/)
        .reply(200, { tostartdate: "2021-07-29T00:00:00+00:00" }, jsonHeaders);
      // Mock BIMS deleting date
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
