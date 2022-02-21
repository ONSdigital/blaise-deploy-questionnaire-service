import { newServer } from "../server";
import supertest, { Response } from "supertest";

import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { Auth } from "blaise-login-react-server";
import { getEnvironmentVariables } from "../config";

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

const { BimsApiUrl } = getEnvironmentVariables();

// Mock Express Server
const request = supertest(newServer());

describe("Sending TO start date to BIMS service", () => {
    it("should return a 201 status when the live date is provided", async () => {
        mock.onGet(`${BimsApiUrl}/tostartdate/OPN2004A`).reply(200, {}, jsonHeaders);
        mock.onPost(`${BimsApiUrl}/tostartdate/OPN2004A`).reply(201, {}, jsonHeaders);


        const response: Response = await request.post("/api/tostartdate/OPN2004A").send({ "tostartdate": "2020-06-05" });

        console.log(mock.history);
        expect(mock.history.post[0].data).toEqual("{\"tostartdate\":\"2020-06-05\"}");
        expect(response.status).toEqual(201);
        expect(response.body).toStrictEqual({});

    });

    it("should return a 400 status when status is successful but returned contentType is not application/json", async () => {
        mock.onGet(`${BimsApiUrl}/tostartdate/OPN2004A`).reply(200, {}, jsonHeaders);
        mock.onPost(`${BimsApiUrl}/tostartdate/OPN2004A`).reply(201, []);


        const response: Response = await request.post("/api/tostartdate/OPN2004A").send({ "tostartdate": "2020-06-05" });

        expect(response.status).toEqual(500);

    });


    it("should return a 500 status direct from the API", async () => {
        mock.onGet(`${BimsApiUrl}/tostartdate/OPN2004A`).reply(200, {}, jsonHeaders);
        mock.onPost(`${BimsApiUrl}/tostartdate/OPN2004A`).reply(500, {}, jsonHeaders);

        const response: Response = await request.post("/api/tostartdate/OPN2004A").send({ "tostartdate": "2020-06-05" });

        expect(response.status).toEqual(500);

    });

    it("should return a 500 status when there is a network error from the API request", async () => {
        mock.onGet(`${BimsApiUrl}/tostartdate/OPN2004A`).reply(200, {}, jsonHeaders);
        mock.onPost(`${BimsApiUrl}/tostartdate/OPN2004A`).networkError();

        const response: Response = await request.post("/api/tostartdate/OPN2004A").send({ "tostartdate": "2020-06-05" });

        expect(response.status).toEqual(500);

    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        mock.reset();
    });
});

describe("Getting TO start date from BIMS service", () => {
    it("should return a 200 status with a TO start date object when the start date is provided", async () => {
        mock.onGet(`${BimsApiUrl}/tostartdate/OPN2004A`).reply(200, { "tostartdate": "2020-06-05" }, jsonHeaders);


        const response: Response = await request.get("/api/tostartdate/OPN2004A");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual({ "tostartdate": "2020-06-05" });

    });

    it("should return a 400 status when status is successful but returned contentType is not application/json", async () => {
        mock.onGet(`${BimsApiUrl}/tostartdate/OPN2004A`).reply(200, { "tostartdate": "2020-06-05" });


        const response: Response = await request.get("/api/tostartdate/OPN2004A");

        expect(response.status).toEqual(500);

    });


    it("should return a 500 status direct from the API", async () => {
        mock.onGet(`${BimsApiUrl}/tostartdate/OPN2004A`).reply(500, {}, jsonHeaders);

        const response: Response = await request.get("/api/tostartdate/OPN2004A");

        expect(response.status).toEqual(500);

    });

    it("should return a 500 status when there is a network error from the API request", async () => {
        mock.onGet(`${BimsApiUrl}/tostartdate/OPN2004A`).networkError();


        const response: Response = await request.get("/api/tostartdate/OPN2004A");

        expect(response.status).toEqual(500);

    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        mock.reset();
    });
});

describe("Deleting TO start date to BIMS service", () => {
    it("should return a 204 status when the TO date has been deleted", async () => {
        mock.onGet(`${BimsApiUrl}/tostartdate/OPN2004A`).reply(200, { "tostartdate": "2020-06-05" }, jsonHeaders);
        mock.onDelete(`${BimsApiUrl}/tostartdate/OPN2004A`).reply(204, {}, jsonHeaders);


        const response: Response = await request.delete("/api/tostartdate/OPN2004A");

        expect(response.status).toEqual(204);

    });

    it("should return a 204 status when the TO date doesn't exits", async () => {
        mock.onGet(`${BimsApiUrl}/tostartdate/OPN2004A`).reply(404, {}, jsonHeaders);


        const response: Response = await request.delete("/api/tostartdate/OPN2004A");

        expect(response.status).toEqual(204);

    });


    it("should return a 500 status direct from the API", async () => {
        mock.onGet(`${BimsApiUrl}/tostartdate/OPN2004A`).reply(200, { "tostartdate": "2020-06-05" }, jsonHeaders);
        mock.onDelete(`${BimsApiUrl}/tostartdate/OPN2004A`).reply(500, {}, jsonHeaders);

        const response: Response = await request.delete("/api/tostartdate/OPN2004A");

        expect(response.status).toEqual(500);

    });

    it("should return a 500 status when there is a network error from the API request", async () => {
        mock.onGet(`${BimsApiUrl}/tostartdate/OPN2004A`).reply(200, { "tostartdate": "2020-06-05" }, jsonHeaders);
        mock.onDelete(`${BimsApiUrl}/tostartdate/OPN2004A`).networkError();


        const response: Response = await request.delete("/api/tostartdate/OPN2004A");

        expect(response.status).toEqual(500);

    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        mock.reset();
    });
});
