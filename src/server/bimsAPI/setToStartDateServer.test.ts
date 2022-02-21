import {newServer} from "../server";
import supertest, {Response} from "supertest";

import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {defineFeature, loadFeature} from "jest-cucumber";
import {Auth} from "blaise-login-react-server";

jest.mock("blaise-login-react-server", () => {
    const loginReact = jest.requireActual("blaise-login-react-server");
    return {
        ...loginReact
    };
});
Auth.prototype.ValidateToken = jest.fn().mockReturnValue(true);

jest.mock("blaise-api-node-client");
const { DiagnosticMockObject, InstrumentListMockObject, InstrumentMockObject, InstrumentSettingsMockList } = jest.requireActual("blaise-api-node-client");

// Mock Express Server
const request = supertest(newServer());
// Create Mock adapter for Axios requests
const mock = new MockAdapter(axios, {onNoMatch: "throwException"});
const jsonHeaders = {"content-type": "application/json"};

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
