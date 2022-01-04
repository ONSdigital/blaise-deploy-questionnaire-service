/**
 * @jest-environment node
 */
import app from "./server"; // Link to your server file
import supertest from "supertest";

jest.mock("blaise-api-node-client");
import BlaiseApiRest from "blaise-api-node-client";

const request = supertest(app);

describe("Test Heath Endpoint", () => {
    it("should return a 200 status and json message", async done => {
        const response = await request.get("/dqs-ui/version/health");

        expect(response.statusCode).toEqual(200);
        expect(response.body).toStrictEqual({ healthy: true });
        done();
    });
});


describe("Given the API returns 2 instruments", () => {
    beforeAll(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        BlaiseApiRest.mockImplementation(() => {
            return {
                getInstrumentsWithCatiData: () => {
                    return Promise.resolve(apiInstrumentList);
                },
            };
        });
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

    afterAll(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });
});

describe("Get list of instruments endpoint fails", () => {
    beforeAll(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        BlaiseApiRest.mockImplementation(() => {
            return {
                getInstrumentsWithCatiData: () => {
                    return Promise.reject("Network error");
                },
            };
        });
    });

    it("should return a 500 status and an error message", async () => {
        const response = await request.get("/api/instruments");
        expect(response.statusCode).toEqual(500);
    });

    afterAll(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });
});
