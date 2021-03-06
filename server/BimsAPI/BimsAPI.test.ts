import app from "../server";
import supertest, {Response} from "supertest";

import MockAdapter from "axios-mock-adapter";
import axios from "axios";

// Mock Express Server
const request = supertest(app);
// Create Mock adapter for Axios requests
const mock = new MockAdapter(axios, {onNoMatch: "throwException"});
const jsonHeaders = {"content-type": "application/json"};

describe("Sending TO start date to BIMS service", () => {
    it("should return a 201 status when the live date is provided", async done => {
        mock.onPost(/\/tostartdate\/OPN2004A$/).reply(201, [], jsonHeaders);


        const response: Response = await request.post("/api/tostartdate/OPN2004A").send({"tostartdate": "2020-06-05"});

        expect(mock.history.post[0].data).toEqual("{\"tostartdate\":\"2020-06-05\"}");
        expect(response.status).toEqual(201);
        expect(response.body).toStrictEqual([]);
        done();
    });

    it("should return a 400 status when status is successful but returned contentType is not application/json", async done => {
        mock.onPost(/\/tostartdate\/OPN2004A$/).reply(201, []);


        const response: Response = await request.post("/api/tostartdate/OPN2004A").send({"tostartdate": "2020-06-05"});

        expect(response.status).toEqual(400);
        done();
    });


    it("should return a 500 status direct from the API", async done => {
        mock.onPost(/\/tostartdate\/OPN2004A$/).reply(500, {}, jsonHeaders);

        const response: Response = await request.post("/api/tostartdate/OPN2004A").send({"tostartdate": "2020-06-05"});

        expect(response.status).toEqual(500);
        done();
    });

    it("should return a 500 status when there is a network error from the API request", async done => {
        mock.onPost(/\/tostartdate\/OPN2004A$/).networkError();

        const response: Response = await request.post("/api/tostartdate/OPN2004A").send({"tostartdate": "2020-06-05"});

        expect(response.status).toEqual(500);
        done();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        mock.reset();
    });
});

describe("Getting TO start date from BIMS service", () => {
    it("should return a 200 status with a TO start date object when the start date is provided", async done => {
        mock.onGet(/\/tostartdate\/OPN2004A$/).reply(200, {"tostartdate": "2020-06-05"}, jsonHeaders);


        const response: Response = await request.get("/api/tostartdate/OPN2004A");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual({"tostartdate": "2020-06-05"});
        done();
    });

    it("should return a 400 status when status is successful but returned contentType is not application/json", async done => {
        mock.onGet(/\/tostartdate\/OPN2004A$/).reply(200, {"tostartdate": "2020-06-05"});


        const response: Response = await request.get("/api/tostartdate/OPN2004A");

        expect(response.status).toEqual(400);
        done();
    });


    it("should return a 500 status direct from the API", async done => {
        mock.onGet(/\/tostartdate\/OPN2004A$/).reply(500, {}, jsonHeaders);


        const response: Response = await request.get("/api/tostartdate/OPN2004A");

        expect(response.status).toEqual(500);
        done();
    });

    it("should return a 500 status when there is a network error from the API request", async done => {
        mock.onGet(/\/tostartdate\/OPN2004A$/).networkError();


        const response: Response = await request.get("/api/tostartdate/OPN2004A");

        expect(response.status).toEqual(500);
        done();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        mock.reset();
    });
});

describe("Deleting TO start date to BIMS service", () => {
    it("should return a 204 status when the TO date has been deleted", async done => {
        mock.onGet(/\/tostartdate\/OPN2004A$/).reply(200, {"tostartdate": "2020-06-05"}, jsonHeaders);
        mock.onDelete(/\/tostartdate\/OPN2004A$/).reply(204, {}, jsonHeaders);


        const response: Response = await request.delete("/api/tostartdate/OPN2004A");

        expect(response.status).toEqual(204);
        done();
    });

    it("should return a 204 status when the TO date doesn't exits", async done => {
        mock.onGet(/\/tostartdate\/OPN2004A$/).reply(404, {}, jsonHeaders);


        const response: Response = await request.delete("/api/tostartdate/OPN2004A");

        expect(response.status).toEqual(204);
        done();
    });


    it("should return a 500 status direct from the API", async done => {
        mock.onGet(/\/tostartdate\/OPN2004A$/).reply(200, {"tostartdate": "2020-06-05"}, jsonHeaders);
        mock.onDelete(/\/tostartdate\/OPN2004A$/).reply(500, {}, jsonHeaders);

        const response: Response = await request.delete("/api/tostartdate/OPN2004A");

        expect(response.status).toEqual(500);
        done();
    });

    it("should return a 500 status when there is a network error from the API request", async done => {
        mock.onGet(/\/tostartdate\/OPN2004A$/).reply(200, {"tostartdate": "2020-06-05"}, jsonHeaders);
        mock.onDelete(/\/tostartdate\/OPN2004A$/).networkError();


        const response: Response = await request.delete("/api/tostartdate/OPN2004A");

        expect(response.status).toEqual(500);
        done();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        mock.reset();
    });
});
