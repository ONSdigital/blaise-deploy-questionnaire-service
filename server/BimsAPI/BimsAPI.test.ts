import app from "../server";
import supertest, {Response} from "supertest";

import MockAdapter from "axios-mock-adapter";
import axios from "axios";

// Mock Express Server
const request = supertest(app);
// Create Mock adapter for Axios requests
const mock = new MockAdapter(axios, {onNoMatch: "throwException"});
const jsonHeaders = {"content-type": "application/json"};

describe("Data Delivery Get all batches from API", () => {
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
