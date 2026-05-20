import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { Auth } from "blaise-login-react-server";
import pino from "pino";
import { type HttpLogger, pinoHttp } from "pino-http";
import supertest, { type Response } from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getConfigFromEnv } from "../config.js";
import { newServer } from "../server.js";

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

Auth.prototype.validateToken = vi.fn().mockReturnValue(true);
Auth.prototype.getUser = vi
  .fn()
  .mockImplementation((token) => (token === "example-token" ? { name: "rich" } : {}));
Auth.prototype.getToken = vi.fn().mockReturnValue("example-token");

vi.mock("blaise-iap-node-provider");

const logger: pino.Logger = pino();

logger.child = vi.fn(() => logger) as unknown as typeof logger.child;
const logInfo = vi.spyOn(logger, "info");
const logError = vi.spyOn(logger, "error");
const httpLogger: HttpLogger = pinoHttp({ logger: logger });

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });
const jsonHeaders = { "content-type": "application/json" };

vi.spyOn(axios, "create").mockReturnValue(axios);

const config = getConfigFromEnv();
const request = supertest(newServer(config, httpLogger));

describe("Sending Telephone Operations start date to BIMS service", () => {
  afterEach(() => {
    vi.clearAllMocks();
    mock.reset();
  });

  it("should return a 400 status when the Telephone Operations start date payload is missing", async () => {
    const response: Response = await request.post("/api/tostartdate/OPN2004A").send({});

    expect(response.status).toEqual(400);
    expect(response.body).toStrictEqual({ message: "Invalid tostartdate" });
    expect(mock.history.get).toHaveLength(0);
  });

  it("should return a 400 status when the Telephone Operations start date is a non-empty invalid value", async () => {
    const response: Response = await request
      .post("/api/tostartdate/OPN2004A")
      .send({ tostartdate: "not-a-date" });

    expect(response.status).toEqual(400);
    expect(response.body).toStrictEqual({ message: "Invalid tostartdate" });
    expect(mock.history.get).toHaveLength(0);
  });

  it("should return a 400 status when the request body is not a JSON object", async () => {
    const response: Response = await request
      .post("/api/tostartdate/OPN2004A")
      .set("Content-Type", "text/plain")
      .send("not-json");

    expect(response.status).toEqual(400);
    expect(response.body).toStrictEqual({ message: "Invalid tostartdate" });
    expect(mock.history.get).toHaveLength(0);
  });

  it("should return 201 with an empty body when no existing Telephone Operations start date is found and none is provided", async () => {
    mock.onGet(`${config.bimsApiUrl}/tostartdate/OPN2004A`).reply(404, {}, jsonHeaders);

    const response: Response = await request
      .post("/api/tostartdate/OPN2004A")
      .send({ tostartdate: "" });

    expect(response.status).toEqual(201);
    expect(response.body).toStrictEqual("");
  });

  it("should delete an existing Telephone Operations start date when an empty Telephone Operations start date is provided", async () => {
    mock
      .onGet(`${config.bimsApiUrl}/tostartdate/OPN2004A`)
      .reply(200, { tostartdate: "2022-01-01" }, jsonHeaders);
    mock.onDelete(`${config.bimsApiUrl}/tostartdate/OPN2004A`).reply(204, {}, jsonHeaders);

    const response: Response = await request
      .post("/api/tostartdate/OPN2004A")
      .send({ tostartdate: "" });

    expect(response.status).toEqual(201);
    expect(mock.history.delete.length).toBe(1);
    expect(logInfo).toHaveBeenCalledWith(
      "AUDIT_LOG: rich deleted OPN2004A Telephone Operations start date (previously 2022-01-01)",
    );
  });

  it("should return 500 when deleting an existing Telephone Operations start date fails", async () => {
    mock
      .onGet(`${config.bimsApiUrl}/tostartdate/OPN2004A`)
      .reply(200, { tostartdate: "2022-01-01" }, jsonHeaders);
    mock.onDelete(`${config.bimsApiUrl}/tostartdate/OPN2004A`).reply(500, {}, jsonHeaders);

    const response: Response = await request
      .post("/api/tostartdate/OPN2004A")
      .send({ tostartdate: "" });

    expect(response.status).toEqual(500);
  });

  it("should update an existing Telephone Operations start date when a new value is provided", async () => {
    mock
      .onGet(`${config.bimsApiUrl}/tostartdate/OPN2004A`)
      .reply(200, { tostartdate: "2022-01-01" }, jsonHeaders);
    mock
      .onPatch(`${config.bimsApiUrl}/tostartdate/OPN2004A`)
      .reply(200, { tostartdate: "2022-12-31" }, jsonHeaders);

    const response: Response = await request
      .post("/api/tostartdate/OPN2004A")
      .send({ tostartdate: "2022-12-31" });

    expect(response.status).toEqual(201);
    expect(response.body).toStrictEqual({ tostartdate: "2022-12-31" });
    expect(mock.history.patch[0].data).toEqual('{"tostartdate":"2022-12-31"}');
    expect(logInfo).toHaveBeenCalledWith(
      "AUDIT_LOG: rich updated OPN2004A Telephone Operations start date to 2022-12-31 (previously 2022-01-01)",
    );
  });

  it("should audit-log a failure when updating an existing Telephone Operations start date fails", async () => {
    mock
      .onGet(`${config.bimsApiUrl}/tostartdate/OPN2004A`)
      .reply(200, { tostartdate: "2022-01-01" }, jsonHeaders);
    mock.onPatch(`${config.bimsApiUrl}/tostartdate/OPN2004A`).networkError();

    const response: Response = await request
      .post("/api/tostartdate/OPN2004A")
      .send({ tostartdate: "2022-12-31" });

    expect(response.status).toEqual(500);
    expect(logError).toHaveBeenCalledWith(
      "AUDIT_LOG: rich failed to set OPN2004A Telephone Operations start date to 2022-12-31 (previously 2022-01-01)",
    );
  });

  it("should return a 201 status when a Telephone Operations start date is provided", async () => {
    mock.onGet(`${config.bimsApiUrl}/tostartdate/OPN2004A`).reply(200, {}, jsonHeaders);
    mock.onPost(`${config.bimsApiUrl}/tostartdate/OPN2004A`).reply(201, {}, jsonHeaders);

    const response: Response = await request
      .post("/api/tostartdate/OPN2004A")
      .send({ tostartdate: "2022-12-31" });

    expect(mock.history.post[0].data).toEqual('{"tostartdate":"2022-12-31"}');
    expect(response.status).toEqual(201);
    expect(response.body).toStrictEqual({});
    expect(logInfo).toHaveBeenCalledWith(
      "AUDIT_LOG: rich set OPN2004A Telephone Operations start date to 2022-12-31",
    );
  });

  it("should return a 500 status direct from the API", async () => {
    mock.onGet(`${config.bimsApiUrl}/tostartdate/OPN2004A`).reply(200, {}, jsonHeaders);
    mock.onPost(`${config.bimsApiUrl}/tostartdate/OPN2004A`).reply(500, {}, jsonHeaders);

    const response: Response = await request
      .post("/api/tostartdate/OPN2004A")
      .send({ tostartdate: "2022-12-31" });

    expect(response.status).toEqual(500);
  });

  it("should return a 500 status when there is a network error from the API request", async () => {
    mock.onGet(`${config.bimsApiUrl}/tostartdate/OPN2004A`).reply(200, {}, jsonHeaders);
    mock.onPost(`${config.bimsApiUrl}/tostartdate/OPN2004A`).networkError();

    const response: Response = await request
      .post("/api/tostartdate/OPN2004A")
      .send({ tostartdate: "2022-12-31" });

    expect(response.status).toEqual(500);
  });

  it("should audit-log a failure when setting a new Telephone Operations start date fails without a previous value", async () => {
    mock.onGet(`${config.bimsApiUrl}/tostartdate/OPN2004A`).reply(200, {}, jsonHeaders);
    mock.onPost(`${config.bimsApiUrl}/tostartdate/OPN2004A`).networkError();

    const response: Response = await request
      .post("/api/tostartdate/OPN2004A")
      .send({ tostartdate: "2022-12-31" });

    expect(response.status).toEqual(500);
    expect(logError).toHaveBeenCalledWith(
      "AUDIT_LOG: rich failed to set OPN2004A Telephone Operations start date to 2022-12-31",
    );
  });
});

describe("Getting Telephone Operations start date from BIMS service", () => {
  afterEach(() => {
    vi.clearAllMocks();
    mock.reset();
  });

  it("should return a 404 status when BIMS returns no content for the Telephone Operations start date", async () => {
    mock.onGet(`${config.bimsApiUrl}/tostartdate/OPN2004A`).reply(204, undefined, jsonHeaders);

    const response: Response = await request.get("/api/tostartdate/OPN2004A");

    expect(response.status).toEqual(404);
  });

  it("should return a 200 status with a Telephone Operations start date response body when a Telephone Operations start date is provided", async () => {
    mock
      .onGet(`${config.bimsApiUrl}/tostartdate/OPN2004A`)
      .reply(200, { tostartdate: "2022-12-31" }, jsonHeaders);

    const response: Response = await request.get("/api/tostartdate/OPN2004A");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual({ tostartdate: "2022-12-31" });
  });

  it("should return a 500 status direct from the API", async () => {
    mock.onGet(`${config.bimsApiUrl}/tostartdate/OPN2004A`).reply(500, {}, jsonHeaders);

    const response: Response = await request.get("/api/tostartdate/OPN2004A");

    expect(response.status).toEqual(500);
  });

  it("should return a 500 status when there is a network error from the API request", async () => {
    mock.onGet(`${config.bimsApiUrl}/tostartdate/OPN2004A`).networkError();

    const response: Response = await request.get("/api/tostartdate/OPN2004A");

    expect(response.status).toEqual(500);
  });
});

describe("Deleting Telephone Operations start date from BIMS service", () => {
  afterEach(() => {
    vi.clearAllMocks();
    mock.reset();
  });

  it("should return a 204 status when the Telephone Operations start date has been deleted", async () => {
    mock
      .onGet(`${config.bimsApiUrl}/tostartdate/OPN2004A`)
      .reply(200, { tostartdate: "2022-12-31" }, jsonHeaders);
    mock.onDelete(`${config.bimsApiUrl}/tostartdate/OPN2004A`).reply(204, {}, jsonHeaders);

    const response: Response = await request.delete("/api/tostartdate/OPN2004A");

    expect(response.status).toEqual(204);
    expect(logInfo).toHaveBeenCalledWith(
      "AUDIT_LOG: rich deleted OPN2004A Telephone Operations start date (previously 2022-12-31)",
    );
  });

  it("should return a 204 status when the Telephone Operations start date does not exist", async () => {
    mock.onGet(`${config.bimsApiUrl}/tostartdate/OPN2004A`).reply(404, {}, jsonHeaders);

    const response: Response = await request.delete("/api/tostartdate/OPN2004A");

    expect(response.status).toEqual(204);
  });

  it("should return a 500 status direct from the API", async () => {
    mock
      .onGet(`${config.bimsApiUrl}/tostartdate/OPN2004A`)
      .reply(200, { tostartdate: "2022-12-31" }, jsonHeaders);
    mock.onDelete(`${config.bimsApiUrl}/tostartdate/OPN2004A`).reply(500, {}, jsonHeaders);

    const response: Response = await request.delete("/api/tostartdate/OPN2004A");

    expect(response.status).toEqual(500);
  });

  it("should return a 500 status when there is a network error from the API request", async () => {
    mock
      .onGet(`${config.bimsApiUrl}/tostartdate/OPN2004A`)
      .reply(200, { tostartdate: "2022-12-31" }, jsonHeaders);
    mock.onDelete(`${config.bimsApiUrl}/tostartdate/OPN2004A`).networkError();

    const response: Response = await request.delete("/api/tostartdate/OPN2004A");

    expect(response.status).toEqual(500);
    expect(logError).toHaveBeenCalledWith(
      {
        error: "Error: Network Error",
        questionnaireName: "OPN2004A",
      },
      "Failed to delete Telephone Operations start date for questionnaire",
    );
  });
});

describe("Sending Totalmobile release date to BIMS service", () => {
  afterEach(() => {
    vi.clearAllMocks();
    mock.reset();
  });

  it("should return a 400 status when the Totalmobile release date payload is invalid", async () => {
    const response: Response = await request
      .post("/api/tmreleasedate/LMS2004A")
      .send({ tmreleasedate: "not-a-date" });

    expect(response.status).toEqual(400);
    expect(response.body).toStrictEqual({ message: "Invalid tmreleasedate" });
    expect(mock.history.get).toHaveLength(0);
  });

  it("should return a 500 status direct from the API", async () => {
    mock.onGet(`${config.bimsApiUrl}/tmreleasedate/LMS2004A`).reply(200, {}, jsonHeaders);
    mock.onPost(`${config.bimsApiUrl}/tmreleasedate/LMS2004A`).reply(500, {}, jsonHeaders);

    const response: Response = await request
      .post("/api/tmreleasedate/LMS2004A")
      .send({ tmreleasedate: "2022-12-31" });

    expect(response.status).toEqual(500);
  });

  it("should return a 500 status when there is a network error from the API request", async () => {
    mock.onGet(`${config.bimsApiUrl}/tmreleasedate/LMS2004A`).reply(200, {}, jsonHeaders);
    mock.onPost(`${config.bimsApiUrl}/tmreleasedate/LMS2004A`).networkError();

    const response: Response = await request
      .post("/api/tmreleasedate/LMS2004A")
      .send({ tmreleasedate: "2022-12-31" });

    expect(response.status).toEqual(500);
  });

  it("should sanitise object-like errors when setting a Totalmobile release date fails", async () => {
    mock.onGet(`${config.bimsApiUrl}/tmreleasedate/LMS2004A`).reply(200, {}, jsonHeaders);
    mock
      .onPost(`${config.bimsApiUrl}/tmreleasedate/LMS2004A`)
      .reply(() => Promise.reject({ message: "bad\nmessage" }) as never);

    const response: Response = await request
      .post("/api/tmreleasedate/LMS2004A")
      .send({ tmreleasedate: "2022-12-31" });

    expect(response.status).toEqual(500);
    expect(logError).toHaveBeenCalledWith(
      {
        error: "badmessage",
        questionnaireName: "LMS2004A",
      },
      "Failed to set Totalmobile release date for questionnaire",
    );
  });

  describe("when there is no existing Totalmobile release date", () => {
    beforeEach(() => {
      mock.onGet(`${config.bimsApiUrl}/tmreleasedate/LMS2004A`).reply(200, {}, jsonHeaders);
    });

    describe("specifying a new Totalmobile release date", () => {
      beforeEach(() => {
        mock.onPost(`${config.bimsApiUrl}/tmreleasedate/LMS2004A`).reply(201, {}, jsonHeaders);
      });

      it("should return a 201 status", async () => {
        const response: Response = await request
          .post("/api/tmreleasedate/LMS2004A")
          .send({ tmreleasedate: "2022-12-31" });

        expect(response.status).toEqual(201);
        expect(response.body).toStrictEqual({});
      });

      it("updates BIMS with a Totalmobile release date", async () => {
        await request.post("/api/tmreleasedate/LMS2004A").send({ tmreleasedate: "2022-12-31" });
        expect(mock.history.post[0].data).toEqual('{"tmreleasedate":"2022-12-31"}');
      });

      it("should log a message when a Totalmobile release date is provided", async () => {
        await request.post("/api/tmreleasedate/LMS2004A").send({ tmreleasedate: "2022-12-31" });

        expect(logInfo).toHaveBeenCalledWith(
          "AUDIT_LOG: rich set LMS2004A Totalmobile release date to 2022-12-31",
        );
      });
    });

    describe("not specifying any Totalmobile release date", () => {
      it("should return a 201 status", async () => {
        const response: Response = await request
          .post("/api/tmreleasedate/LMS2004A")
          .send({ tmreleasedate: "" });

        expect(response.status).toEqual(201);
        expect(response.body).toStrictEqual("");
      });
    });
  });

  describe("when there is an existing Totalmobile release date", () => {
    beforeEach(() => {
      mock.onGet(`${config.bimsApiUrl}/tmreleasedate/LMS2004A`).reply(
        200,
        {
          tmreleasedate: "2022-06-27T16:29:00+00:00",
        },
        jsonHeaders,
      );
    });

    describe("specifying a new Totalmobile release date", () => {
      beforeEach(() => {
        mock.onPatch(`${config.bimsApiUrl}/tmreleasedate/LMS2004A`).reply(201, {}, jsonHeaders);
      });

      it("should return a 201 status", async () => {
        const response: Response = await request
          .post("/api/tmreleasedate/LMS2004A")
          .send({ tmreleasedate: "2022-12-31" });

        expect(response.status).toEqual(201);
        expect(response.body).toStrictEqual({});
      });

      it("updates BIMS with a Totalmobile release date", async () => {
        await request.post("/api/tmreleasedate/LMS2004A").send({ tmreleasedate: "2022-12-31" });
        expect(mock.history.patch[0].data).toEqual('{"tmreleasedate":"2022-12-31"}');
      });

      it("should log a message when a Totalmobile release date is provided", async () => {
        await request.post("/api/tmreleasedate/LMS2004A").send({ tmreleasedate: "2022-12-31" });
        expect(logInfo).toHaveBeenCalledWith(
          "AUDIT_LOG: rich updated LMS2004A Totalmobile release date to 2022-12-31 (previously 2022-06-27)",
        );
      });

      it("should audit-log a failure when updating an existing Totalmobile release date fails", async () => {
        mock.resetHandlers();
        mock.onGet(`${config.bimsApiUrl}/tmreleasedate/LMS2004A`).reply(
          200,
          {
            tmreleasedate: "2022-06-27T16:29:00+00:00",
          },
          jsonHeaders,
        );
        mock.onPatch(`${config.bimsApiUrl}/tmreleasedate/LMS2004A`).networkError();

        const response: Response = await request
          .post("/api/tmreleasedate/LMS2004A")
          .send({ tmreleasedate: "2022-12-31" });

        expect(response.status).toEqual(500);
        expect(logError).toHaveBeenCalledWith(
          "AUDIT_LOG: rich failed to update LMS2004A Totalmobile release date to 2022-12-31 (previously 2022-06-27)",
        );
      });
    });

    describe("deleting a Totalmobile release date", () => {
      beforeEach(() => {
        mock.onDelete(`${config.bimsApiUrl}/tmreleasedate/LMS2004A`).reply(204, {}, jsonHeaders);
      });

      it("should return a 204 status", async () => {
        const response: Response = await request
          .post("/api/tmreleasedate/LMS2004A")
          .send({ tmreleasedate: "" });

        expect(response.status).toEqual(201);
        expect(response.body).toStrictEqual("");
      });

      it("updates BIMS with a Totalmobile release date", async () => {
        await request.post("/api/tmreleasedate/LMS2004A").send({ tmreleasedate: "" });
        expect(mock.history.delete.length).toBe(1);
      });

      it("should log a message when a Totalmobile release date is not provided", async () => {
        await request.post("/api/tmreleasedate/LMS2004A").send({ tmreleasedate: "" });
        expect(logInfo).toHaveBeenCalledWith(
          "AUDIT_LOG: rich deleted LMS2004A Totalmobile release date (previously 2022-06-27)",
        );
      });

      it("should audit-log a failure when deleting an existing Totalmobile release date fails", async () => {
        mock.resetHandlers();
        mock.onGet(`${config.bimsApiUrl}/tmreleasedate/LMS2004A`).reply(
          200,
          {
            tmreleasedate: "2022-06-27T16:29:00+00:00",
          },
          jsonHeaders,
        );
        mock.onDelete(`${config.bimsApiUrl}/tmreleasedate/LMS2004A`).networkError();

        const response: Response = await request
          .post("/api/tmreleasedate/LMS2004A")
          .send({ tmreleasedate: "" });

        expect(response.status).toEqual(500);
        expect(logError).toHaveBeenCalledWith(
          "AUDIT_LOG: rich failed to delete LMS2004A Totalmobile release date (previously 2022-06-27)",
        );
      });
    });
  });
});

describe("Getting Totalmobile release date from BIMS service", () => {
  afterEach(() => {
    vi.clearAllMocks();
    mock.reset();
  });

  it("should return a 200 status with a Totalmobile release date response body when a Totalmobile release date is provided", async () => {
    mock
      .onGet(`${config.bimsApiUrl}/tmreleasedate/LMS2004A`)
      .reply(200, { tmreleasedate: "2022-12-31" }, jsonHeaders);

    const response: Response = await request.get("/api/tmreleasedate/LMS2004A");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual({ tmreleasedate: "2022-12-31" });
  });

  it("should return a 404 status when BIMS returns no content for the Totalmobile release date", async () => {
    mock.onGet(`${config.bimsApiUrl}/tmreleasedate/LMS2004A`).reply(204, undefined, jsonHeaders);

    const response: Response = await request.get("/api/tmreleasedate/LMS2004A");

    expect(response.status).toEqual(404);
  });

  it("should return a 500 status direct from the API", async () => {
    mock.onGet(`${config.bimsApiUrl}/tmreleasedate/LMS2004A`).reply(500, {}, jsonHeaders);

    const response: Response = await request.get("/api/tmreleasedate/LMS2004A");

    expect(response.status).toEqual(500);
  });

  it("should return a 500 status when there is a network error from the API request", async () => {
    mock.onGet(`${config.bimsApiUrl}/tmreleasedate/LMS2004A`).networkError();

    const response: Response = await request.get("/api/tmreleasedate/LMS2004A");

    expect(response.status).toEqual(500);
  });
});

describe("Deleting Totalmobile release date to BIMS service", () => {
  afterEach(() => {
    vi.clearAllMocks();
    mock.reset();
  });

  it("should return a 204 status when the Totalmobile release date has been deleted", async () => {
    mock
      .onGet(`${config.bimsApiUrl}/tmreleasedate/LMS2004A`)
      .reply(200, { tmreleasedate: "2022-12-31" }, jsonHeaders);
    mock.onDelete(`${config.bimsApiUrl}/tmreleasedate/LMS2004A`).reply(204, {}, jsonHeaders);

    const response: Response = await request.delete("/api/tmreleasedate/LMS2004A");

    expect(response.status).toEqual(204);
  });

  it("should log a message the Totalmobile release date has been deleted", async () => {
    mock
      .onGet(`${config.bimsApiUrl}/tmreleasedate/LMS2004A`)
      .reply(200, { tmreleasedate: "2022-12-31" }, jsonHeaders);
    mock.onDelete(`${config.bimsApiUrl}/tmreleasedate/LMS2004A`).reply(204, {}, jsonHeaders);

    await request.delete("/api/tmreleasedate/LMS2004A");

    expect(logInfo).toHaveBeenCalledWith(
      "AUDIT_LOG: rich deleted LMS2004A Totalmobile release date (previously 2022-12-31)",
    );
  });

  it("should return a 204 status when the Totalmobile release date does not exist", async () => {
    mock.onGet(`${config.bimsApiUrl}/tmreleasedate/LMS2004A`).reply(404, {}, jsonHeaders);

    const response: Response = await request.delete("/api/tmreleasedate/LMS2004A");

    expect(response.status).toEqual(204);
  });

  it("should return a 500 status direct from the API", async () => {
    mock
      .onGet(`${config.bimsApiUrl}/tmreleasedate/LMS2004A`)
      .reply(200, { tmreleasedate: "2022-12-31" }, jsonHeaders);
    mock.onDelete(`${config.bimsApiUrl}/tmreleasedate/LMS2004A`).reply(500, {}, jsonHeaders);

    const response: Response = await request.delete("/api/tmreleasedate/LMS2004A");

    expect(response.status).toEqual(500);
  });

  it("should return a 500 status when there is a network error from the API request", async () => {
    mock
      .onGet(`${config.bimsApiUrl}/tmreleasedate/LMS2004A`)
      .reply(200, { tmreleasedate: "2022-12-31" }, jsonHeaders);
    mock.onDelete(`${config.bimsApiUrl}/tmreleasedate/LMS2004A`).networkError();

    const response: Response = await request.delete("/api/tmreleasedate/LMS2004A");

    expect(response.status).toEqual(500);
  });

  it("should sanitise non-error values when deleting a Totalmobile release date fails", async () => {
    mock
      .onGet(`${config.bimsApiUrl}/tmreleasedate/LMS2004A`)
      .reply(200, { tmreleasedate: "2022-12-31" }, jsonHeaders);
    mock
      .onDelete(`${config.bimsApiUrl}/tmreleasedate/LMS2004A`)
      .reply(() => Promise.reject("bad\nmessage") as never);

    const response: Response = await request.delete("/api/tmreleasedate/LMS2004A");

    expect(response.status).toEqual(500);
    expect(logError).toHaveBeenCalledWith(
      {
        error: "badmessage",
        questionnaireName: "LMS2004A",
      },
      "Failed to delete Totalmobile release date for questionnaire",
    );
  });

  it("should fall back to stringifying object-like errors with non-string messages", async () => {
    mock
      .onGet(`${config.bimsApiUrl}/tmreleasedate/LMS2004A`)
      .reply(200, { tmreleasedate: "2022-12-31" }, jsonHeaders);
    mock
      .onDelete(`${config.bimsApiUrl}/tmreleasedate/LMS2004A`)
      .reply(() => Promise.reject({ message: { detail: "bad" } }) as never);

    const response: Response = await request.delete("/api/tmreleasedate/LMS2004A");

    expect(response.status).toEqual(500);
    expect(logError).toHaveBeenCalledWith(
      {
        error: "[object Object]",
        questionnaireName: "LMS2004A",
      },
      "Failed to delete Totalmobile release date for questionnaire",
    );
  });
});
