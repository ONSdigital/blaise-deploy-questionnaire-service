/**
 * @jest-environment node
 */
import app from "./server"; // Link to your server file
import supertest from "supertest";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

const request = supertest(app);

// This sets the mock adapter on the default instance
const mock = new MockAdapter(axios, {onNoMatch: "throwException"});


describe("Test Heath Endpoint", () => {
    it("should return a 200 status and json message", async done => {
        const response = await request.get("/health_check");

        expect(response.statusCode).toEqual(200);
        expect(response.body).toStrictEqual({status: 200});
        done();
    });
});


// Mock any GET request to /api/instruments
// arguments for reply are (status, data, headers)


describe("Given the API returns 2 instruments", () => {
    beforeAll(() => {
        mock.onGet("http://" + process.env.BLAISE_API_URL + "/api/v1/cati/serverparks/server-park/instruments").reply(200,
            apiInstrumentList,
        );
    });

    const apiInstrumentList = [
        {
            activeToday: true,
            expired: false,
            installDate: "2020-12-11T11:53:55.5612856+00:00",
            name: "OPN2007T",
            serverParkName: "LocalDevelopment"
        },
        {
            activeToday: false,
            expired: false,
            installDate: "2020-12-11T11:53:55.5612856+00:00",
            name: "OPN2004A",
            serverParkName: "LocalDevelopment"
        }
    ];

    const apiReturnedInstrumentList = [
        {
            activeToday: true,
            expired: false,
            installDate: "2020-12-11T11:53:55.5612856+00:00",
            name: "OPN2007T",
            serverParkName: "LocalDevelopment",
            fieldPeriod: "July 2020"
        },
        {
            activeToday: false,
            expired: false,
            installDate: "2020-12-11T11:53:55.5612856+00:00",
            name: "OPN2004A",
            serverParkName: "LocalDevelopment",
            fieldPeriod: "April 2020"
        }
    ];

    it("should return a 200 status and a list with the two", async done => {
        const response = await request.get("/api/instruments");

        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveLength(2);
        expect(response.body).toStrictEqual(apiReturnedInstrumentList);
        done();
    });

    afterAll(() => {
        mock.reset();
    });
});

describe.skip("Get list of instruments endpoint fails", () => {
    beforeAll(() => {
        mock.onGet("http://" + process.env.BLAISE_API_URL + "/api/v1/cati/serverparks/server-park/instruments").networkError();
    });

    it("should return a 500 status and an error message", async done => {
        const response = await request.get("/api/instruments");

        expect(response.statusCode).toEqual(500);
        expect(JSON.stringify(response.body)).toMatch(/(Network Error)/i);
        done();
    });

    afterAll(() => {
        mock.reset();
    });
});
