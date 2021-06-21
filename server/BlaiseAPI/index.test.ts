import app from "../server"; // Link to your server file
import supertest, {Response} from "supertest";

import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {expectedInstrumentList, healthCheckFromAPI, instrumentFromAPI, instrumentListFromAPI} from "./mockObjects";


// Mock Express Server
const request = supertest(app);
// Create Mock adapter for Axios requests
const mock = new MockAdapter(axios, {onNoMatch: "throwException"});

describe("BlaiseAPI Get health Check from API", () => {
    it("should return a 200 status and an json list of 4 items when API returns a 4 item list", async done => {
        mock.onGet(/v1\/health\/diagnosis$/).reply(200, healthCheckFromAPI);

        const response: Response = await request.get("/api/health/diagnosis");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual(healthCheckFromAPI);
        expect(response.body.length).toStrictEqual(4);
        done();
    });

    it("should return a 500 status direct from the API", async done => {
        mock.onGet(/v1\/health\/diagnosis$/).reply(500, {});

        const response: Response = await request.get("/api/health/diagnosis");

        expect(response.status).toEqual(500);
        done();
    });

    it("should return a 500 status when there is a network error from the API request", async done => {
        mock.onGet(/v1\/health\/diagnosis$/).networkError();

        const response: Response = await request.get("/api/health/diagnosis");

        expect(response.status).toEqual(500);
        done();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        mock.reset();
    });
});

describe("BlaiseAPI Get all instruments from API", () => {
    it("should return a 200 status and an empty json list when API returns a empty list", async done => {
        mock.onGet(/v1\/cati\/serverparks\/server-park\/instruments$/).reply(200, []);


        const response: Response = await request.get("/api/instruments");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual([]);
        done();
    });

    it("should return a 200 status and an json list of 3 items when API returns a 3 item list", async done => {
        mock.onGet(/v1\/cati\/serverparks\/server-park\/instruments$/).reply(200, instrumentListFromAPI);

        const response: Response = await request.get("/api/instruments");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual(expectedInstrumentList);
        expect(response.body.length).toStrictEqual(3);
        done();
    });

    it("should return a 500 status direct from the API", async done => {
        mock.onGet(/v1\/cati\/serverparks\/server-park\/instruments$/).reply(500, {});

        const response: Response = await request.get("/api/instruments");

        expect(response.status).toEqual(500);
        done();
    });

    it("should return a 500 status when there is a network error from the API request", async done => {
        mock.onGet(/v1\/cati\/serverparks\/server-park\/instruments$/).networkError();

        const response: Response = await request.get("/api/instruments");

        expect(response.status).toEqual(500);
        done();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        mock.reset();
    });
});


describe("BlaiseAPI Get specific instrument information from API", () => {
    it("should return a 200 status with the data as false when API returns can't find the instrument", async done => {
        mock.onGet(/v1\/serverparks\/server-park\/instruments\/OPN2004A\/exists$/).reply(200, false);

        const response: Response = await request.get("/api/instruments/OPN2004A");

        expect(response.status).toEqual(200);
        expect(response.body).toEqual(false);

        done();
    });

    it("should return a 200 status and an json object when API returns a instrument object", async done => {
        mock.onGet(/v1\/serverparks\/server-park\/instruments\/OPN2101A\/exists$/).reply(200, true);
        mock.onGet(/v1\/cati\/serverparks\/server-park\/instruments\/OPN2101A$/).reply(200, instrumentFromAPI);

        const response: Response = await request.get("/api/instruments/OPN2101A");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual(instrumentFromAPI);
        done();
    });

    it("should return a 500 status direct from the API", async done => {
        mock.onGet(/v1\/cati\/serverparks\/server-park\/instruments\/OPN2101A$/).reply(500, {});

        const response: Response = await request.get("/api/instruments/OPN2101A");

        expect(response.status).toEqual(500);
        done();
    });

    it("should return a 500 status when there is a network error from the API request", async done => {
        mock.onGet(/v1\/cati\/serverparks\/server-park\/instruments\/OPN2101A$/).networkError();

        const response: Response = await request.get("/api/instruments/OPN2101A");

        expect(response.status).toEqual(500);
        done();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        mock.reset();
    });
});


describe("BlaiseAPI Post to API to install a specific instrument", () => {
    it("should return a 201 status when API installs a instrument", async done => {
        mock.onPost(/v1\/serverparks\/server-park\/instruments$/).reply(201);

        const response: Response = await request.get("/api/install?filename=OPN2101A");

        expect(response.status).toEqual(201);
        done();
    });

    it("should return a 500 status direct from the API", async done => {
        mock.onPost(/v1\/serverparks\/server-park\/instruments/).reply(500, {});

        const response: Response = await request.get("/api/install?filename=OPN2101A");

        expect(response.status).toEqual(500);
        done();
    });

    it("should return a 500 status when there is a network error from the API request", async done => {
        mock.onPost(/v1\/serverparks\/server-park\/instruments$/).networkError();

        const response: Response = await request.get("/api/install?filename=OPN2101A");

        expect(response.status).toEqual(500);
        done();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        mock.reset();
    });
});


describe("BlaiseAPI Delete a specific instrument", () => {
    it("should return a 204 status when API deletes a instrument successfuly", async done => {
        mock.onDelete(/v1\/serverparks\/server-park\/instruments\/OPN2101A/).reply(204);

        const response: Response = await request.delete("/api/instruments/OPN2101A");

        expect(response.status).toEqual(204);
        done();
    });

    it("should return a 404 status direct from the API", async done => {
        mock.onDelete(/v1\/serverparks\/server-park\/instruments\/OPN2101A/).reply(404, {});

        const response: Response = await request.delete("/api/instruments/OPN2101A");

        expect(response.status).toEqual(404);
        done();
    });

    it("should return a 500 status direct from the API", async done => {
        mock.onDelete(/v1\/serverparks\/server-park\/instruments\/OPN2101A/).reply(500, {});

        const response: Response = await request.delete("/api/instruments/OPN2101A");

        expect(response.status).toEqual(500);
        done();
    });

    it("should return a 500 status when there is a network error from the API request", async done => {
        mock.onDelete(/v1\/serverparks\/server-park\/instruments\/OPN2101A/).networkError();

        const response: Response = await request.delete("/api/instruments/OPN2101A");

        expect(response.status).toEqual(500);
        done();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        mock.reset();
    });
});

