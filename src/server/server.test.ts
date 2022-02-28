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

const mockGetInstrumentsWithCatiData = jest.fn();
BlaiseApiRest.prototype.getInstrumentsWithCatiData = mockGetInstrumentsWithCatiData;

const config = getConfigFromEnv();
const request = supertest(newServer(config));

describe("Test Heath Endpoint", () => {
    it("should return a 200 status and json message", async () => {
        const response = await request.get("/dqs-ui/version/health");

        expect(response.statusCode).toEqual(200);
        expect(response.body).toStrictEqual({ healthy: true });

    });
});


describe("Given the API returns 2 instruments", () => {
    beforeEach(() => {
        mockGetInstrumentsWithCatiData.mockImplementation(() => {
            return Promise.resolve(apiInstrumentList);
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
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

    it("should return a 200 status and a list with the two", async () => {
        const response = await request.get("/api/instruments");

        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveLength(2);
        expect(response.body).toStrictEqual(apiReturnedInstrumentList);
    });
});

describe("Get list of instruments endpoint fails", () => {
    beforeEach(() => {
        mockGetInstrumentsWithCatiData.mockImplementation(() => {
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
