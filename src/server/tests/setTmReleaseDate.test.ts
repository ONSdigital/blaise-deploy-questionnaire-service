import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { Auth } from "blaise-login-react-server";
import supertest, { type Response } from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";

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

vi.mock("blaise-iap-node-provider");

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });
const jsonHeaders = { "content-type": "application/json" };

vi.spyOn(axios, "create").mockReturnValue(axios);

const config = getConfigFromEnv();
const request = supertest(newServer(config));

describe("Totalmobile release date server flows", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mock.reset();
  });

  it("sets a new Totalmobile release date when none exists", async () => {
    mock.onGet(/\/tmreleasedate\/OPN2004A$/).reply(404, {}, jsonHeaders);
    mock
      .onPost(/\/tmreleasedate\/OPN2004A$/)
      .reply(201, { tmreleasedate: "2025-01-15T00:00:00+00:00" }, jsonHeaders);

    const response: Response = await request
      .post("/api/tmreleasedate/OPN2004A")
      .send({ tmreleasedate: "2025-01-15" });

    expect(response.status).toEqual(201);
    expect(response.body).toEqual({ tmreleasedate: "2025-01-15T00:00:00+00:00" });
  });

  it("updates an existing Totalmobile release date", async () => {
    mock
      .onGet(/\/tmreleasedate\/OPN2004A$/)
      .reply(200, { tmreleasedate: "2024-12-25T00:00:00+00:00" }, jsonHeaders);
    mock
      .onPatch(/\/tmreleasedate\/OPN2004A$/)
      .reply(200, { tmreleasedate: "2025-01-15T00:00:00+00:00" }, jsonHeaders);

    const response: Response = await request
      .post("/api/tmreleasedate/OPN2004A")
      .send({ tmreleasedate: "2025-01-15" });

    expect(response.status).toEqual(201);
    expect(response.body).toEqual({ tmreleasedate: "2025-01-15T00:00:00+00:00" });
  });

  it("deletes an existing Totalmobile release date when an empty string is posted", async () => {
    mock
      .onGet(/\/tmreleasedate\/OPN2004A$/)
      .reply(200, { tmreleasedate: "2024-12-25T00:00:00+00:00" }, jsonHeaders);
    mock.onDelete(/\/tmreleasedate\/OPN2004A$/).reply(204, [], jsonHeaders);

    const response: Response = await request
      .post("/api/tmreleasedate/OPN2004A")
      .send({ tmreleasedate: "" });

    expect(response.status).toEqual(201);
  });
});
