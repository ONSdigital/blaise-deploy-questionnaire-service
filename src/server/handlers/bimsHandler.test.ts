import { newServer } from "../server";
import supertest, { Response } from "supertest";

import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { Auth } from "blaise-login-react-server";
import { getConfigFromEnv } from "../config";

jest.mock("blaise-login-react-server", () => {
    const loginReact = jest.requireActual("blaise-login-react-server");
    return {
        ...loginReact
    };
});
Auth.prototype.ValidateToken = jest.fn().mockReturnValue(true);

jest.mock("blaise-iap-node-provider");


// Create Mock adapter for Axios requests
const mock = new MockAdapter(axios, { onNoMatch: "throwException" });
const jsonHeaders = { "content-type": "application/json" };

// Mock Express Server
const config = getConfigFromEnv();
const request = supertest(newServer(config));

describe("Sending TO start date to BIMS service", () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
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
        jest.resetModules();
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
        jest.resetModules();
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

describe("Sending TM release date to BIMS service", () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        mock.reset();
    });

    it("should return a 201 status when the release date is provided", async () => {
        mock.onGet(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`).reply(200, {}, jsonHeaders);
        mock.onPost(`${config.BimsApiUrl}/tmreleasedate/LMS2004A`).reply(201, {}, jsonHeaders);

        const response: Response = await request.post("/api/tmreleasedate/LMS2004A").send({ "tmreleasedate": "2022-12-31" });

        console.log(mock.history);
        expect(mock.history.post[0].data).toEqual("{\"tmreleasedate\":\"2022-12-31\"}");
        expect(response.status).toEqual(201);
        expect(response.body).toStrictEqual({});
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
});

describe("Getting TM release date from BIMS service", () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
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

describe("Deleting TM release date to BIMS service", () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
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
