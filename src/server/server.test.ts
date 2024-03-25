/**
 * @jest-environment node
 */
import { newServer } from "./server";
import supertest from "supertest";

jest.mock("blaise-api-node-client");
import BlaiseApiRest from "blaise-api-node-client";
import { Auth } from "blaise-login-react/blaise-login-react-server";
import { getConfigFromEnv } from "./config";

jest.mock("blaise-login-react/blaise-login-react-server", () => {
    const loginReact = jest.requireActual("blaise-login-react/blaise-login-react-server");
    return {
        ...loginReact
    };
});
Auth.prototype.ValidateToken = jest.fn().mockReturnValue(true);

const mockGetQuestionnaires = jest.fn();
BlaiseApiRest.prototype.getQuestionnaires = mockGetQuestionnaires;

const config = getConfigFromEnv();
const request = supertest(newServer(config));

describe("Test Health Endpoint", () => {
    it("should return a 200 status and json message", async () => {
        const response = await request.get("/dqs-ui/version/health");

        expect(response.statusCode).toEqual(200);
        expect(response.body).toStrictEqual({ healthy: true });

    });
});

describe("Given the API returns 2 questionnaires", () => {
    beforeEach(() => {
        mockGetQuestionnaires.mockImplementation(() => {
            return Promise.resolve(apQuestionnaireList);
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    const apQuestionnaireList = [
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

    const apiReturnedQuestionnaireList = [
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
        const response = await request.get("/api/questionnaires");

        expect(response.statusCode).toEqual(200);
        expect(response.body).toHaveLength(2);
        expect(response.body).toStrictEqual(apiReturnedQuestionnaireList);
    });
});

describe("Get list of questionnaires endpoint fails", () => {
    beforeEach(() => {
        mockGetQuestionnaires.mockImplementation(() => {
            return Promise.reject("Network error");
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should return a 500 status and an error message", async () => {
        const response = await request.get("/api/questionnaires");
        expect(response.statusCode).toEqual(500);
    });
});
