import app from "../server";
import supertest, {Response} from "supertest";

import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {defineFeature, loadFeature} from "jest-cucumber";

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

const feature = loadFeature("./src/features/set_telephone_operations_start_date.feature", {tagFilter: "@server"});

/**
 * These scenarios don't really work as unit tests,
 * but they work as a decent structure to unit test the BimsAPI requests in the node.js server.
 */
defineFeature(feature, test => {

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        mock.reset();
    });

    test("Overwrite questionnaire and previous TO Start Date with new", ({given, when, then}) => {
        let response: Response;

        given("a pre-deployed questionnaire that already has a TO Start Date stored against it", () => {
            // Mock BIMS already having a live date stored
            mock.onGet(/\/tostartdate\/OPN2004A$/).reply(200, {"tostartdate": "2021-07-29T00:00:00+00:00"}, jsonHeaders);
            // Mock BIMS storing updated date
            mock.onPatch(/\/tostartdate\/OPN2004A$/).reply(200, [], jsonHeaders);
        });

        when("a TO Start Date is specified", async () => {
            response = await request.post("/api/tostartdate/OPN2004A").send({"tostartdate": "2020-06-05"});
        });

        then("the new TO Start Date will overwrite the previous", () => {
            expect(response.status).toEqual(200);
        });
    });

    test("Overwrite questionnaire and remove previous TO Start Date", ({given, when, then}) => {
        let response: Response;

        given("a pre-deployed questionnaire that already has a TO Start Date stored against it", () => {
            // Mock BIMS already having a live date stored
            mock.onGet(/\/tostartdate\/OPN2004A$/).reply(200, {"tostartdate": "2021-07-29T00:00:00+00:00"}, jsonHeaders);
            // Mock BIMS deleting date
            mock.onDelete(/\/tostartdate\/OPN2004A$/).reply(204, [], jsonHeaders);
        });

        when("a TO Start Date is not specified", async () => {
            response = await request.post("/api/tostartdate/OPN2004A").send({"tostartdate": ""});
        });

        then("the original TO Start Date is removed from data store", () => {
            expect(response.status).toEqual(200);
        });
    });
});
