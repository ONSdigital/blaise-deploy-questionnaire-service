import { newServer } from "../server";
import supertest, { Response } from "supertest";

import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { Auth } from "blaise-login-react-server";
import { getConfigFromEnv } from "../config";
import createLogger, { HttpLogger } from "pino-http";
import pino from "pino";

jest.mock("blaise-login-react-server", () => {
    const loginReact = jest.requireActual("blaise-login-react-server");
    return {
        ...loginReact
    };
});
Auth.prototype.ValidateToken = jest.fn().mockReturnValue(true);

jest.mock("blaise-iap-node-provider");

const logger: pino.Logger = pino(); // Real logger instance
logger.child = jest.fn(() => logger); // Dirty little hack
const logInfo = jest.spyOn(logger, "info"); // Get jest test to spy on it
const httpLogger: HttpLogger = createLogger({ logger: logger }); // Logging middleware

// Create Mock adapter for Axios requests
const mock = new MockAdapter(axios, { onNoMatch: "throwException" });
const jsonHeaders = { "content-type": "application/json" };

// Mock Express Server
const config = getConfigFromEnv();
const request = supertest(newServer(config, httpLogger));

describe("Sending TO start date to BIMS service", () => {
    afterEach(() => {
        jest.clearAllMocks();
        mock.reset();
    });

    it("should return a 201 status when the live date is provided", async () => {
        mock.onGet(`${config.BimsApiUrl}/tostartdate/OPN2004A`).reply(200, {}, jsonHeaders);
        mock.onPost(`${config.BimsApiUrl}/tostartdate/OPN2004A`).reply(201, {}, jsonHeaders);

        const response: Response = await request.post("/api/tostartdate/OPN2004A").send({ "tostartdate": "2022-12-31" });

        console.log(mock.history);
        expect(mock.history.post[0].data).toEqual("{\"tostartdate\":\"2022-12-31\"}");
        expect(response.status).toEqual(201);
        expect(response.body).toStrictEqual({});
    });

    it("should return a 500 status direct from the API", async () => {
        mock.onGet(`${config.BimsApiUrl}/tostartdate/OPN2004A`).reply(200, {}, jsonHeaders);
        mock.onPost(`${config.BimsApiUrl}/tostartdate/OPN2004A`).reply(500, {}, jsonHeaders);

        const response: Response = await request.post("/api/tostartdate/OPN2004A").send({ "tostartdate": "2022-12-31" });

        expect(response.status).toEqual(500);
    });

    it("should return a 500 status when there is a network error from the API request", async () => {
        mock.onGet(`${config.BimsApiUrl}/tostartdate/OPN2004A`).reply(200, {}, jsonHeaders);
        mock.onPost(`${config.BimsApiUrl}/tostartdate/OPN2004A`).networkError();

        const response: Response = await request.post("/api/tostartdate/OPN2004A").send({ "tostartdate": "2022-12-31" });

        expect(response.status).toEqual(500);
    });
});

describe("Getting TO start date from BIMS service", () => {
    afterEach(() => {
        jest.clearAllMocks();
        mock.reset();
    });

    it("should return a 200 status with a TO start date object when the start date is provided", async () => {
        mock.onGet(`${config.BimsApiUrl}/tostartdate/OPN2004A`).reply(200, { "tostartdate": "2022-12-31" }, jsonHeaders);

        const response: Response = await request.get("/api/tostartdate/OPN2004A");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual({ "tostartdate": "2022-12-31" });
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

describe("Deleting TO start date to BIMS service", () => {
    afterEach(() => {
        jest.clearAllMocks();
        mock.reset();
    });

    it("should return a 204 status when the TO date has been deleted", async () => {
        mock.onGet(`${config.BimsApiUrl}/tostartdate/OPN2004A`).reply(200, { "tostartdate": "2022-12-31" }, jsonHeaders);
        mock.onDelete(`${config.BimsApiUrl}/tostartdate/OPN2004A`).reply(204, {}, jsonHeaders);

        const response: Response = await request.delete("/api/tostartdate/OPN2004A");

        expect(response.status).toEqual(204);
    });

    it("should return a 204 status when the TO date doesn't exits", async () => {
        mock.onGet(`${config.BimsApiUrl}/tostartdate/OPN2004A`).reply(404, {}, jsonHeaders);

        const response: Response = await request.delete("/api/tostartdate/OPN2004A");

        expect(response.status).toEqual(204);
    });

    it("should return a 500 status direct from the API", async () => {
        mock.onGet(`${config.BimsApiUrl}/tostartdate/OPN2004A`).reply(200, { "tostartdate": "2022-12-31" }, jsonHeaders);
        mock.onDelete(`${config.BimsApiUrl}/tostartdate/OPN2004A`).reply(500, {}, jsonHeaders);

        const response: Response = await request.delete("/api/tostartdate/OPN2004A");

        expect(response.status).toEqual(500);
    });

    it("should return a 500 status when there is a network error from the API request", async () => {
        mock.onGet(`${config.BimsApiUrl}/tostartdate/OPN2004A`).reply(200, { "tostartdate": "2022-12-31" }, jsonHeaders);
        mock.onDelete(`${config.BimsApiUrl}/tostartdate/OPN2004A`).networkError();

        const response: Response = await request.delete("/api/tostartdate/OPN2004A");

        expect(response.status).toEqual(500);
    });
});

describe("Sending Totalmobile release date to BIMS service", () => {
    afterEach(() => {
        jest.clearAllMocks();
        mock.reset();
    });

    it("should return a 500 status direct from the API", async () => {
        mock.onGet(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`).reply(200, {}, jsonHeaders);
        mock.onPost(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`).reply(500, {}, jsonHeaders);

        const response: Response = await request.post("/api/tmreleasedate/LMS2004A").send({ "tmreleasedate": "2022-12-31" });

        expect(response.status).toEqual(500);
    });

    it("should return a 500 status when there is a network error from the API request", async () => {
        mock.onGet(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`).reply(200, {}, jsonHeaders);
        mock.onPost(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`).networkError();

        const response: Response = await request.post("/api/tmreleasedate/LMS2004A").send({ "tmreleasedate": "2022-12-31" });

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
                const response: Response = await request.post("/api/tmreleasedate/LMS2004A").send({ "tmreleasedate": "2022-12-31" });

                expect(response.status).toEqual(201);
                expect(response.body).toStrictEqual({});
            });

            it("updates BIMS with a release date", async () => {
                await request.post("/api/tmreleasedate/LMS2004A").send({ "tmreleasedate": "2022-12-31" });
                expect(mock.history.post[0].data).toEqual("{\"tmreleasedate\":\"2022-12-31\"}");
            });

            it("should log a message when a release date is provided", async () => {
                await request.post("/api/tmreleasedate/LMS2004A").send({ "tmreleasedate": "2022-12-31" });

                expect(logInfo).toHaveBeenCalledWith("AUDIT_LOG: Totalmobile release date set to 2022-12-31 for LMS2004A");
            });
        });

        describe("not specifying any release date", () => {

            it("should return a 201 status", async () => {
                const response: Response = await request.post("/api/tmreleasedate/LMS2004A").send({ "tmreleasedate": "" });

                expect(response.status).toEqual(201);
                expect(response.body).toStrictEqual(""); // Not consistent :sob:
            });

            it("should log a message when a release date is not provided", async () => {
                await request.post("/api/tmreleasedate/LMS2004A").send({ "tmreleasedate": "" });

                expect(logInfo).toHaveBeenCalledWith("AUDIT_LOG: No Totalmobile release date set for LMS2004A");
            });
        });
    });

    describe("when there is an existing release date", () => {
        beforeEach(() => {
            mock.onGet(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`).reply(200,
                {
                    "tmreleasedate": "2022-06-27T16:29:00+00:00"
                }, jsonHeaders);
        });

        describe("specifying a new release date", () => {
            beforeEach(() => {
                mock.onPatch(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`).reply(201, {}, jsonHeaders);
            });

            it("should return a 201 status", async () => {
                const response: Response = await request.post("/api/tmreleasedate/LMS2004A").send({ "tmreleasedate": "2022-12-31" });

                expect(response.status).toEqual(201);
                expect(response.body).toStrictEqual({});
            });

            it("updates BIMS with a release date", async () => {
                await request.post("/api/tmreleasedate/LMS2004A").send({ "tmreleasedate": "2022-12-31" });
                expect(mock.history.patch[0].data).toEqual("{\"tmreleasedate\":\"2022-12-31\"}");
            });

            it("should log a message when a release date is provided", async () => {
                await request.post("/api/tmreleasedate/LMS2004A").send({ "tmreleasedate": "2022-12-31" });
                expect(logInfo).toHaveBeenCalledWith("AUDIT_LOG: Totalmobile release date updated to 2022-12-31 for LMS2004A. Previously 2022-06-27");
            });
        });

        describe("deleting a release date", () => {
            beforeEach(() => {
                mock.onDelete(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`).reply(204, {}, jsonHeaders);
            });

            it("should return a 204 status", async () => {
                const response: Response = await request.post("/api/tmreleasedate/LMS2004A").send({ "tmreleasedate": "" });

                expect(response.status).toEqual(201); // 201 because it's an update not a delete
                expect(response.body).toStrictEqual(""); // currently returns an empty string - not consistent
            });

            it("updates BIMS with a release date", async () => {
                await request.post("/api/tmreleasedate/LMS2004A").send({ "tmreleasedate": "" });
                expect(mock.history.delete.length).toBe(1);
            });

            it("should log a message when a release date is not provided", async () => {
                await request.post("/api/tmreleasedate/LMS2004A").send({ "tmreleasedate": "" });
                expect(logInfo).toHaveBeenCalledWith("AUDIT_LOG: Totalmobile release date deleted for LMS2004A. Previously 2022-06-27");
            });
        });
    });
});

describe("Getting Totalmobile release date from BIMS service", () => {
    afterEach(() => {
        jest.clearAllMocks();
        mock.reset();
    });

    it("should return a 200 status with a TM release date object when the release date is provided", async () => {
        mock.onGet(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`).reply(200, { "tmreleasedate": "2022-12-31" }, jsonHeaders);

        const response: Response = await request.get("/api/tmreleasedate/LMS2004A");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual({ "tmreleasedate": "2022-12-31" });
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
        jest.clearAllMocks();
        mock.reset();
    });

    it("should return a 204 status when the TM release date has been deleted", async () => {
        mock.onGet(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`).reply(200, { "tmreleasedate": "2022-12-31" }, jsonHeaders);
        mock.onDelete(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`).reply(204, {}, jsonHeaders);

        const response: Response = await request.delete("/api/tmreleasedate/LMS2004A");

        expect(response.status).toEqual(204);
    });

    it("should return a 204 status when the TM release date doesn't exits", async () => {
        mock.onGet(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`).reply(404, {}, jsonHeaders);

        const response: Response = await request.delete("/api/tmreleasedate/LMS2004A");

        expect(response.status).toEqual(204);
    });

    it("should return a 500 status direct from the API", async () => {
        mock.onGet(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`).reply(200, { "tmreleasedate": "2022-12-31" }, jsonHeaders);
        mock.onDelete(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`).reply(500, {}, jsonHeaders);

        const response: Response = await request.delete("/api/tmreleasedate/LMS2004A");

        expect(response.status).toEqual(500);
    });

    it("should return a 500 status when there is a network error from the API request", async () => {
        mock.onGet(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`).reply(200, { "tmreleasedate": "2022-12-31" }, jsonHeaders);
        mock.onDelete(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`).networkError();

        const response: Response = await request.delete("/api/tmreleasedate/LMS2004A");

        expect(response.status).toEqual(500);
    });
});
