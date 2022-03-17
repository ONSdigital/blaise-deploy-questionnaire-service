/**
 * @jest-environment node
 */
import { newServer } from "./server";
import supertest from "supertest";

jest.mock("blaise-api-node-client");
import BlaiseApiRest from "blaise-api-node-client";
import { Auth } from "blaise-login-react-server";
import { getConfigFromEnv } from "./config";

jest.mock("blaise-login-react-server", () => {
    const loginReact = jest.requireActual("blaise-login-react-server");
    return {
        ...loginReact
    };
});
Auth.prototype.ValidateToken = jest.fn().mockReturnValue(true);

const mockGetInstruments = jest.fn();
BlaiseApiRest.prototype.getInstruments = mockGetInstruments;

const config = getConfigFromEnv();
const request = supertest(newServer(config));

describe("Test Health Endpoint", () => {
    it("should return a 200 status and json message", async () => {
        const response = await request.get("/dqs-ui/version/health");

        expect(response.statusCode).toEqual(200);
        expect(response.body).toStrictEqual({ healthy: true });

    });
});

describe("Given the API returns 2 instruments", () => {
    beforeEach(() => {
        mockGetInstruments.mockImplementation(() => {
            return Promise.resolve(apiInstrumentList);
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    const apiInstrumentList = [
        {
            installDate: "2020-12-11T11:53:55.5612856+00:00",
            name: "OPN2007T",
            serverParkName: "LocalDevelopment"
        },
        {
            installDate: "2020-12-11T11:53:55.5612856+00:00",
            name: "OPN2004A",
            serverParkName: "LocalDevelopment"
        }
    ];

    const apiReturnedInstrumentList = [
        {
            installDate: "2020-12-11T11:53:55.5612856+00:00",
            name: "OPN2007T",
            serverParkName: "LocalDevelopment",
            fieldPeriod: "July 2020"
        },
        {
            installDate: "2020-12-11T11:53:55.5612856+00:00",
            name: "OPN2004A",
            serverParkName: "LocalDevelopment",
            fieldPeriod: "April 2020"
        }
    ];

    it("should return a 200 status and a list with the two", async () => {
        const response = await request.get("/api/instruments");

        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveLength(2);
        expect(response.body).toStrictEqual(apiReturnedInstrumentList);
    });
});

describe("Get list of instruments endpoint fails", () => {
    beforeEach(() => {
        mockGetInstruments.mockImplementation(() => {
            return Promise.reject("Network error");
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should return a 500 status and an error message", async () => {
        const response = await request.get("/api/instruments");
        expect(response.statusCode).toEqual(500);
    });
});
