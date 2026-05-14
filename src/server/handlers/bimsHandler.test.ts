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

Auth.prototype.ValidateToken = vi.fn().mockReturnValue(true);
Auth.prototype.GetUser = vi
  .fn()
  .mockImplementation((token) => (token === "example-token" ? { name: "rich" } : {}));
Auth.prototype.GetToken = vi.fn().mockReturnValue("example-token");

vi.mock("blaise-iap-node-provider");

const logger: pino.Logger = pino();

logger.child = vi.fn(() => logger) as unknown as typeof logger.child;
const logInfo = vi.spyOn(logger, "info");
const httpLogger: HttpLogger = pinoHttp({ logger: logger });

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });
const jsonHeaders = { "content-type": "application/json" };

const config = getConfigFromEnv();
const request = supertest(newServer(config, httpLogger));

describe("Sending Telephone Operations start date to BIMS service", () => {
  afterEach(() => {
    vi.clearAllMocks();
    mock.reset();
  });

  it("should return 201 with an empty body when no existing Telephone Operations start date is found and none is provided", async () => {
    mock.onGet(`${config.BimsApiUrl}/tostartdate/OPN2004A`).reply(404, {}, jsonHeaders);

    const response: Response = await request
      .post("/api/tostartdate/OPN2004A")
      .send({ tostartdate: "" });

    expect(response.status).toEqual(201);
    expect(response.body).toStrictEqual("");
  });

  it("should delete an existing Telephone Operations start date when an empty start date is provided", async () => {
    mock
      .onGet(`${config.BimsApiUrl}/tostartdate/OPN2004A`)
      .reply(200, { tostartdate: "2022-01-01" }, jsonHeaders);
    mock.onDelete(`${config.BimsApiUrl}/tostartdate/OPN2004A`).reply(204, {}, jsonHeaders);

    const response: Response = await request
      .post("/api/tostartdate/OPN2004A")
      .send({ tostartdate: "" });

    expect(response.status).toEqual(201);
    expect(mock.history.delete.length).toBe(1);
  });

  it("should return 500 when deleting an existing Telephone Operations start date fails", async () => {
    mock
      .onGet(`${config.BimsApiUrl}/tostartdate/OPN2004A`)
      .reply(200, { tostartdate: "2022-01-01" }, jsonHeaders);
    mock.onDelete(`${config.BimsApiUrl}/tostartdate/OPN2004A`).reply(500, {}, jsonHeaders);

    const response: Response = await request
      .post("/api/tostartdate/OPN2004A")
      .send({ tostartdate: "" });

    expect(response.status).toEqual(500);
  });

  it("should update an existing Telephone Operations start date when a new value is provided", async () => {
    mock
      .onGet(`${config.BimsApiUrl}/tostartdate/OPN2004A`)
      .reply(200, { tostartdate: "2022-01-01" }, jsonHeaders);
    mock
      .onPatch(`${config.BimsApiUrl}/tostartdate/OPN2004A`)
      .reply(200, { tostartdate: "2022-12-31" }, jsonHeaders);

    const response: Response = await request
      .post("/api/tostartdate/OPN2004A")
      .send({ tostartdate: "2022-12-31" });

    expect(response.status).toEqual(201);
    expect(response.body).toStrictEqual({ tostartdate: "2022-12-31" });
    expect(mock.history.patch[0].data).toEqual('{"tostartdate":"2022-12-31"}');
  });

  it("should return a 201 status when a Telephone Operations start date is provided", async () => {
    mock.onGet(`${config.BimsApiUrl}/tostartdate/OPN2004A`).reply(200, {}, jsonHeaders);
    mock.onPost(`${config.BimsApiUrl}/tostartdate/OPN2004A`).reply(201, {}, jsonHeaders);

    const response: Response = await request
      .post("/api/tostartdate/OPN2004A")
      .send({ tostartdate: "2022-12-31" });

    console.log(mock.history);
    expect(mock.history.post[0].data).toEqual('{"tostartdate":"2022-12-31"}');
    expect(response.status).toEqual(201);
    expect(response.body).toStrictEqual({});
  });

  it("should return a 500 status direct from the API", async () => {
    mock.onGet(`${config.BimsApiUrl}/tostartdate/OPN2004A`).reply(200, {}, jsonHeaders);
    mock.onPost(`${config.BimsApiUrl}/tostartdate/OPN2004A`).reply(500, {}, jsonHeaders);

    const response: Response = await request
      .post("/api/tostartdate/OPN2004A")
      .send({ tostartdate: "2022-12-31" });

    expect(response.status).toEqual(500);
  });

  it("should return a 500 status when there is a network error from the API request", async () => {
    mock.onGet(`${config.BimsApiUrl}/tostartdate/OPN2004A`).reply(200, {}, jsonHeaders);
    mock.onPost(`${config.BimsApiUrl}/tostartdate/OPN2004A`).networkError();

    const response: Response = await request
      .post("/api/tostartdate/OPN2004A")
      .send({ tostartdate: "2022-12-31" });

    expect(response.status).toEqual(500);
  });
});

describe("Getting Telephone Operations start date from BIMS service", () => {
  afterEach(() => {
    vi.clearAllMocks();
    mock.reset();
  });

  it("should return a 404 status when BIMS returns no content for the start date", async () => {
    mock.onGet(`${config.BimsApiUrl}/tostartdate/OPN2004A`).reply(204, undefined, jsonHeaders);

    const response: Response = await request.get("/api/tostartdate/OPN2004A");

    expect(response.status).toEqual(404);
  });

  it("should return a 200 status with a Telephone Operations start date response body when a start date is provided", async () => {
    mock
      .onGet(`${config.BimsApiUrl}/tostartdate/OPN2004A`)
      .reply(200, { tostartdate: "2022-12-31" }, jsonHeaders);

    const response: Response = await request.get("/api/tostartdate/OPN2004A");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual({ tostartdate: "2022-12-31" });
  });

  it("should return a 500 status direct from the API", async () => {
    mock.onGet(`${config.BimsApiUrl}/tostartdate/OPN2004A`).reply(500, {}, jsonHeaders);

    const response: Response = await request.get("/api/tostartdate/OPN2004A");

    expect(response.status).toEqual(500);
  });

  it("should return a 500 status when there is a network error from the API request", async () => {
    mock.onGet(`${config.BimsApiUrl}/tostartdate/OPN2004A`).networkError();

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
      .onGet(`${config.BimsApiUrl}/tostartdate/OPN2004A`)
      .reply(200, { tostartdate: "2022-12-31" }, jsonHeaders);
    mock.onDelete(`${config.BimsApiUrl}/tostartdate/OPN2004A`).reply(204, {}, jsonHeaders);

    const response: Response = await request.delete("/api/tostartdate/OPN2004A");

    expect(response.status).toEqual(204);
  });

  it("should return a 204 status when the Telephone Operations start date does not exist", async () => {
    mock.onGet(`${config.BimsApiUrl}/tostartdate/OPN2004A`).reply(404, {}, jsonHeaders);

    const response: Response = await request.delete("/api/tostartdate/OPN2004A");

    expect(response.status).toEqual(204);
  });

  it("should return a 500 status direct from the API", async () => {
    mock
      .onGet(`${config.BimsApiUrl}/tostartdate/OPN2004A`)
      .reply(200, { tostartdate: "2022-12-31" }, jsonHeaders);
    mock.onDelete(`${config.BimsApiUrl}/tostartdate/OPN2004A`).reply(500, {}, jsonHeaders);

    const response: Response = await request.delete("/api/tostartdate/OPN2004A");

    expect(response.status).toEqual(500);
  });

  it("should return a 500 status when there is a network error from the API request", async () => {
    mock
      .onGet(`${config.BimsApiUrl}/tostartdate/OPN2004A`)
      .reply(200, { tostartdate: "2022-12-31" }, jsonHeaders);
    mock.onDelete(`${config.BimsApiUrl}/tostartdate/OPN2004A`).networkError();

    const response: Response = await request.delete("/api/tostartdate/OPN2004A");

    expect(response.status).toEqual(500);
  });
});

describe("Sending Totalmobile release date to BIMS service", () => {
  afterEach(() => {
    vi.clearAllMocks();
    mock.reset();
  });

  it("should return a 500 status direct from the API", async () => {
    mock.onGet(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`).reply(200, {}, jsonHeaders);
    mock.onPost(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`).reply(500, {}, jsonHeaders);

    const response: Response = await request
      .post("/api/tmreleasedate/LMS2004A")
      .send({ tmreleasedate: "2022-12-31" });

    expect(response.status).toEqual(500);
  });

  it("should return a 500 status when there is a network error from the API request", async () => {
    mock.onGet(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`).reply(200, {}, jsonHeaders);
    mock.onPost(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`).networkError();

    const response: Response = await request
      .post("/api/tmreleasedate/LMS2004A")
      .send({ tmreleasedate: "2022-12-31" });

    expect(response.status).toEqual(500);
  });

  describe("when there is no existing release date", () => {
    beforeEach(() => {
      mock.onGet(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`).reply(200, {}, jsonHeaders);
    });

    describe("specifying a new release date", () => {
      beforeEach(() => {
        mock.onPost(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`).reply(201, {}, jsonHeaders);
      });

      it("should return a 201 status", async () => {
        const response: Response = await request
          .post("/api/tmreleasedate/LMS2004A")
          .send({ tmreleasedate: "2022-12-31" });

        expect(response.status).toEqual(201);
        expect(response.body).toStrictEqual({});
      });

      it("updates BIMS with a release date", async () => {
        await request.post("/api/tmreleasedate/LMS2004A").send({ tmreleasedate: "2022-12-31" });
        expect(mock.history.post[0].data).toEqual('{"tmreleasedate":"2022-12-31"}');
      });

      it("should log a message when a release date is provided", async () => {
        await request.post("/api/tmreleasedate/LMS2004A").send({ tmreleasedate: "2022-12-31" });

        expect(logInfo).toHaveBeenCalledWith(
          "AUDIT_LOG: Totalmobile release date set to 2022-12-31 for LMS2004A by rich",
        );
      });
    });

    describe("not specifying any release date", () => {
      it("should return a 201 status", async () => {
        const response: Response = await request
          .post("/api/tmreleasedate/LMS2004A")
          .send({ tmreleasedate: "" });

        expect(response.status).toEqual(201);
        expect(response.body).toStrictEqual("");
      });

      it("should log a message when a release date is not provided", async () => {
        await request.post("/api/tmreleasedate/LMS2004A").send({ tmreleasedate: "" });

        expect(logInfo).toHaveBeenCalledWith(
          "AUDIT_LOG: No release date set for LMS2004A",
        );
      });
    });
  });

  describe("when there is an existing release date", () => {
    beforeEach(() => {
      mock.onGet(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`).reply(
        200,
        {
          tmreleasedate: "2022-06-27T16:29:00+00:00",
        },
        jsonHeaders,
      );
    });

    describe("specifying a new release date", () => {
      beforeEach(() => {
        mock.onPatch(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`).reply(201, {}, jsonHeaders);
      });

      it("should return a 201 status", async () => {
        const response: Response = await request
          .post("/api/tmreleasedate/LMS2004A")
          .send({ tmreleasedate: "2022-12-31" });

        expect(response.status).toEqual(201);
        expect(response.body).toStrictEqual({});
      });

      it("updates BIMS with a release date", async () => {
        await request.post("/api/tmreleasedate/LMS2004A").send({ tmreleasedate: "2022-12-31" });
        expect(mock.history.patch[0].data).toEqual('{"tmreleasedate":"2022-12-31"}');
      });

      it("should log a message when a release date is provided", async () => {
        await request.post("/api/tmreleasedate/LMS2004A").send({ tmreleasedate: "2022-12-31" });
        expect(logInfo).toHaveBeenCalledWith(
          "AUDIT_LOG: Totalmobile release date updated to 2022-12-31 (previously 2022-06-27) for LMS2004A by rich",
        );
      });
    });

    describe("deleting a release date", () => {
      beforeEach(() => {
        mock.onDelete(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`).reply(204, {}, jsonHeaders);
      });

      it("should return a 204 status", async () => {
        const response: Response = await request
          .post("/api/tmreleasedate/LMS2004A")
          .send({ tmreleasedate: "" });

        expect(response.status).toEqual(201);
        expect(response.body).toStrictEqual("");
      });

      it("updates BIMS with a release date", async () => {
        await request.post("/api/tmreleasedate/LMS2004A").send({ tmreleasedate: "" });
        expect(mock.history.delete.length).toBe(1);
      });

      it("should log a message when a release date is not provided", async () => {
        await request.post("/api/tmreleasedate/LMS2004A").send({ tmreleasedate: "" });
        expect(logInfo).toHaveBeenCalledWith(
          "AUDIT_LOG: Totalmobile release date deleted (previously 2022-06-27) for LMS2004A by rich",
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

  it("should return a 200 status with a Totalmobile release date response body when a release date is provided", async () => {
    mock
      .onGet(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`)
      .reply(200, { tmreleasedate: "2022-12-31" }, jsonHeaders);

    const response: Response = await request.get("/api/tmreleasedate/LMS2004A");

    expect(response.status).toEqual(200);
    expect(response.body).toStrictEqual({ tmreleasedate: "2022-12-31" });
  });

  it("should return a 404 status when BIMS returns no content for the release date", async () => {
    mock.onGet(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`).reply(204, undefined, jsonHeaders);

    const response: Response = await request.get("/api/tmreleasedate/LMS2004A");

    expect(response.status).toEqual(404);
  });

  it("should return a 500 status direct from the API", async () => {
    mock.onGet(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`).reply(500, {}, jsonHeaders);

    const response: Response = await request.get("/api/tmreleasedate/LMS2004A");

    expect(response.status).toEqual(500);
  });

  it("should return a 500 status when there is a network error from the API request", async () => {
    mock.onGet(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`).networkError();

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
      .onGet(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`)
      .reply(200, { tmreleasedate: "2022-12-31" }, jsonHeaders);
    mock.onDelete(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`).reply(204, {}, jsonHeaders);

    const response: Response = await request.delete("/api/tmreleasedate/LMS2004A");

    expect(response.status).toEqual(204);
  });

  it("should log a message the Totalmobile release date has been deleted", async () => {
    mock
      .onGet(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`)
      .reply(200, { tmreleasedate: "2022-12-31" }, jsonHeaders);
    mock.onDelete(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`).reply(204, {}, jsonHeaders);

    await request.delete("/api/tmreleasedate/LMS2004A");

    expect(logInfo).toHaveBeenCalledWith(
      "AUDIT_LOG: Totalmobile release date deleted (previously 2022-12-31) for LMS2004A by rich",
    );
  });

  it("should return a 204 status when the Totalmobile release date does not exist", async () => {
    mock.onGet(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`).reply(404, {}, jsonHeaders);

    const response: Response = await request.delete("/api/tmreleasedate/LMS2004A");

    expect(response.status).toEqual(204);
  });

  it("should return a 500 status direct from the API", async () => {
    mock
      .onGet(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`)
      .reply(200, { tmreleasedate: "2022-12-31" }, jsonHeaders);
    mock.onDelete(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`).reply(500, {}, jsonHeaders);

    const response: Response = await request.delete("/api/tmreleasedate/LMS2004A");

    expect(response.status).toEqual(500);
  });

  it("should return a 500 status when there is a network error from the API request", async () => {
    mock
      .onGet(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`)
      .reply(200, { tmreleasedate: "2022-12-31" }, jsonHeaders);
    mock.onDelete(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`).networkError();

    const response: Response = await request.delete("/api/tmreleasedate/LMS2004A");

    expect(response.status).toEqual(500);
  });
});
