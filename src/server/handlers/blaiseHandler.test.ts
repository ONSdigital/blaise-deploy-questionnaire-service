import supertest, { Response } from "supertest";
import {
  instrumentListMockObject, instrumentMockObject, expectedInstrumentList
} from "./mockObjects";
import { Auth } from "blaise-login-react-server";
import BlaiseApiRest from "blaise-api-node-client";
import { newServer } from "../server";
import { getConfigFromEnv } from "../config";

jest.mock("blaise-login-react-server", () => {
  const loginReact = jest.requireActual("blaise-login-react-server");
  return {
    ...loginReact
  };
});
Auth.prototype.ValidateToken = jest.fn().mockReturnValue(true);

const mockGetDiagnostics = jest.fn();
const mockGetInstrument = jest.fn();
const mockGetInstruments = jest.fn();
const mockInstallInstrument = jest.fn();
const mockDeleteInstrument = jest.fn();
const mockActivateInstrument = jest.fn();
const mockDeactivateInstrument = jest.fn();
const mockDoesInstrumentHaveMode = jest.fn();
const mockGetInstrumentModes = jest.fn();
const mockGetInstrumentSettings = jest.fn();
const mockGetSurveyDays = jest.fn();

// BlaiseApiRest.prototype.getDiagnostics = mockGetDiagnostics;
// BlaiseApiRest.prototype.getInstrument = mockGetInstrument;
// BlaiseApiRest.prototype.getInstruments = mockGetInstruments;
// BlaiseApiRest.prototype.installInstrument = mockInstallInstrument;
// BlaiseApiRest.prototype.deleteInstrument = mockDeleteInstrument;
// BlaiseApiRest.prototype.activateInstrument = mockActivateInstrument;
// BlaiseApiRest.prototype.deactivateInstrument = mockDeactivateInstrument;
// BlaiseApiRest.prototype.doesInstrumentHaveMode = mockDoesInstrumentHaveMode;
// BlaiseApiRest.prototype.getInstrumentModes = mockGetInstrumentModes;
// BlaiseApiRest.prototype.getInstrumentSettings = mockGetInstrumentSettings;
// BlaiseApiRest.prototype.getSurveyDays = mockGetSurveyDays;

jest.mock("blaise-api-node-client", () => ({
    _esModule: true,
    ...(jest.requireActual("blaise-api-node-client")),
    default: () => {
        return {
            getDiagnostics : mockGetDiagnostics,
            getInstrument : mockGetInstrument,
            getInstruments : mockGetInstruments,
            installInstrument : mockInstallInstrument,
            deleteInstrument : mockDeleteInstrument,
            activateInstrument : mockActivateInstrument,
            deactivateInstrument : mockDeactivateInstrument,
            doesInstrumentHaveMode : mockDoesInstrumentHaveMode,
            getInstrumentModes : mockGetInstrumentModes,
            getInstrumentSettings : mockGetInstrumentSettings,
            getSurveyDays : mockGetSurveyDays
        }
    },
}));
const { DiagnosticMockObject, InstrumentSettingsMockList } = jest.requireActual("blaise-api-node-client");

// Mock Express Server
const config = getConfigFromEnv();
const request = supertest(newServer(config));

describe("BlaiseAPI Get health Check from API", () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should return a 200 status and a json list of 4 items when API returns a 4 item list", async () => {
        mockGetDiagnostics.mockImplementation(() => {
            return Promise.resolve(DiagnosticMockObject);
        });

        const response: Response = await request.get("/api/health/diagnosis");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual(DiagnosticMockObject);
        expect(response.body.length).toStrictEqual(4);
    });

    it("should return a 500 status direct from the API", async () => {
        mockGetDiagnostics.mockImplementation(() => {
            return Promise.reject();
        });

        const response: Response = await request.get("/api/health/diagnosis");

        expect(response.status).toEqual(500);
    });
});

describe("BlaiseAPI Get all instruments from API", () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should return a 200 status and an empty json list when API returns a empty list", async () => {
        mockGetInstruments.mockImplementation(() => {
            return Promise.resolve([]);
        });

        const response: Response = await request.get("/api/instruments");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual([]);
    });

    it("should return a 200 status and a json list of 3 items when API returns a 3 item list", async () => {
        mockGetInstruments.mockImplementation(() => {
            return Promise.resolve(instrumentListMockObject);
        });

        const response: Response = await request.get("/api/instruments");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual(expectedInstrumentList);
        expect(response.body.length).toStrictEqual(3);
    });

    it("should return a 500 status direct from the API", async () => {
        mockGetInstruments.mockImplementation(() => {
            return Promise.reject();
        });

        const response: Response = await request.get("/api/instruments");

        expect(response.status).toEqual(500);
    });
});

describe("BlaiseAPI Get specific instrument information from API", () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should return a 404 status with the data as false when API returns can't find the instrument", async () => {
        mockGetInstrument.mockImplementation(() => {
            return Promise.reject({response: {status: 404}, isAxiosError: true});
        });

        const response: Response = await request.get("/api/instruments/OPN2004A");

        expect(response.status).toEqual(404);
        expect(response.body).toEqual("");

    });

    it("should return a 200 status and a json object when API returns a instrument object", async () => {
        mockGetInstrument.mockImplementation(() => {
            return Promise.resolve(instrumentMockObject);
        });

        const response: Response = await request.get("/api/instruments/OPN2101A");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual(instrumentMockObject);
    });

    it("should return a 500 status direct from the API", async () => {
        mockGetInstrument.mockImplementation(() => {
            return Promise.reject();
        });

        const response: Response = await request.get("/api/instruments/OPN2101A");

        expect(response.status).toEqual(500);
    });
});

describe("BlaiseAPI Post to API to install a specific instrument", () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should return a 201 status when API installs a instrument", async () => {
        mockInstallInstrument.mockImplementation(() => {
            return Promise.resolve(true);
        });

        const response: Response = await request.post("/api/install").send({filename: "OPN2101A"});

        expect(response.status).toEqual(201);
    });

    it("should return a 500 status direct from the API", async () => {
        mockInstallInstrument.mockImplementation(() => {
            return Promise.reject();
        });

        const response: Response = await request.post("/api/install").send({filename: "OPN2101A"});

        expect(response.status).toEqual(500);
    });
});

describe("BlaiseAPI Delete a specific instrument", () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should return a 204 status when API deletes a instrument successfuly", async () => {
        mockDeleteInstrument.mockImplementation(() => {
            return Promise.resolve(true);
        });

        const response: Response = await request.delete("/api/instruments/OPN2101A");

        expect(response.status).toEqual(204);
    });

    it("should return a 404 status direct from the API", async () => {
        mockDeleteInstrument.mockImplementation(() => {
            return Promise.reject({response: {status: 404}, isAxiosError: true});
        });

        const response: Response = await request.delete("/api/instruments/OPN2101A");

        expect(response.status).toEqual(404);
    });

    it("should return a 500 status direct from the API", async () => {
        mockDeleteInstrument.mockImplementation(() => {
            return Promise.reject({response: {status: 500}, isAxiosError: true});
        });

        const response: Response = await request.delete("/api/instruments/OPN2101A");

        expect(response.status).toEqual(500);
    });
});

describe("BlaiseAPI Activate a specific instrument", () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should return a 204 status when API activates a instrument successfuly", async () => {
        mockActivateInstrument.mockImplementation(() => {
            return Promise.resolve(true);
        });

        const response: Response = await request.patch("/api/instruments/OPN2101A/activate");

        expect(response.status).toEqual(204);
    });

    it("should return a 404 status direct from the API", async () => {
        mockActivateInstrument.mockImplementation(() => {
            return Promise.reject({response: {status: 404}, isAxiosError: true});
        });

        const response: Response = await request.patch("/api/instruments/OPN2101A/activate");

        expect(response.status).toEqual(404);
    });

    it("should return a 500 status direct from the API", async () => {
        mockActivateInstrument.mockImplementation(() => {
            return Promise.reject({response: {status: 500}, isAxiosError: true});
        });

        const response: Response = await request.patch("/api/instruments/OPN2101A/activate");

        expect(response.status).toEqual(500);
    });
});

describe("BlaiseAPI Deactivate a specific instrument", () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should return a 204 status when API activates a instrument successfuly", async () => {
        mockDeactivateInstrument.mockImplementation(() => {
            return Promise.resolve(true);
        });

        const response: Response = await request.patch("/api/instruments/OPN2101A/deactivate");

        expect(response.status).toEqual(204);
    });

    it("should return a 404 status direct from the API", async () => {
        mockDeactivateInstrument.mockImplementation(() => {
            return Promise.reject({response: {status: 404}, isAxiosError: true});
        });

        const response: Response = await request.patch("/api/instruments/OPN2101A/deactivate");

        expect(response.status).toEqual(404);
    });

    it("should return a 500 status direct from the API", async () => {
        mockDeactivateInstrument.mockImplementation(() => {
            return Promise.reject({response: {status: 500}, isAxiosError: true});
        });

        const response: Response = await request.patch("/api/instruments/OPN2101A/deactivate");

        expect(response.status).toEqual(500);
    });
});

describe("BlaiseAPI does instrument have a specific mode API", () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should return a 200 status and a json boolean when API returns a boolean", async () => {
        mockDoesInstrumentHaveMode.mockImplementation(() => {
            return Promise.resolve(true);
        });

        const response: Response = await request.get("/api/instruments/OPN2101A/modes/CAWI");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual(true);
    });

    it("should return a 500 status direct from the API", async () => {
        mockDoesInstrumentHaveMode.mockImplementation(() => {
            return Promise.reject(true);
        });

        const response: Response = await request.get("/api/instruments/OPN2101A/modes/CAWI");

        expect(response.status).toEqual(500);
    });
});

describe("BlaiseAPI get instrument modes", () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should return a 200 status and an empty json list when API returns a empty list", async () => {
        mockGetInstrumentModes.mockImplementation(() => {
            return Promise.resolve([]);
        });

        const response: Response = await request.get("/api/instruments/OPN2101A/modes");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual([]);
    });

    it("should return a 200 status and a json list of 2 items when API returns a 2 item list", async () => {
        mockGetInstrumentModes.mockImplementation(() => {
            return Promise.resolve(["CATI", "CAWI"]);
        });

        const response: Response = await request.get("/api/instruments/OPN2101A/modes");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual(["CATI", "CAWI"]);
        expect(response.body.length).toStrictEqual(2);
    });

    it("should return a 500 status direct from the API", async () => {
        mockGetInstrumentModes.mockImplementation(() => {
            return Promise.reject();
        });

        const response: Response = await request.get("/api/instruments/OPN2101A/modes");

        expect(response.status).toEqual(500);
    });
});

describe("BlaiseAPI get instrument settings", () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should return a 200 status and an empty json list when API returns a empty list", async () => {
        mockGetInstrumentSettings.mockImplementation(() => {
            return Promise.resolve([]);
        });

        const response: Response = await request.get("/api/instruments/OPN2101A/settings");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual([]);
    });

    it("should return a 200 status and a json object when API returns an instrument settings object", async () => {
        mockGetInstrumentSettings.mockImplementation(() => {
            return Promise.resolve(InstrumentSettingsMockList);
        });


        const response: Response = await request.get("/api/instruments/OPN2101A/settings");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual(InstrumentSettingsMockList);
    });

    it("should return a 500 status direct from the API", async () => {
        mockGetInstrumentSettings.mockImplementation(() => {
            return Promise.reject();
        });

        const response: Response = await request.get("/api/instruments/OPN2101A/settings");

        expect(response.status).toEqual(500);
    });
});

describe("BlaiseAPI get survey days", () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should return a 200 status and an empty json list when API returns a empty list", async () => {
        mockGetSurveyDays.mockImplementation(() => {
            return Promise.resolve([]);
        });

        const response: Response = await request.get("/api/instruments/OPN2101A/surveydays");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual([]);
    });

    it("should return a 200 status and a json list of 2 items when API returns a 2 item list", async () => {
        mockGetSurveyDays.mockImplementation(() => {
            return Promise.resolve(
                ["2021-10-05T00:00:00", "2021-10-06T00:00:00"]);
        });

        const response: Response = await request.get("/api/instruments/OPN2101A/surveydays");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual(["2021-10-05T00:00:00", "2021-10-06T00:00:00"]);
        expect(response.body.length).toStrictEqual(2);
    });

    it("should return a 500 status direct from the API", async () => {
        mockGetSurveyDays.mockImplementation(() => {
            return Promise.reject();
        });

        const response: Response = await request.get("/api/instruments/OPN2101A/surveydays");

        expect(response.status).toEqual(500);
    });
});

describe("BlaiseAPI get survey is active", () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should return a 200 status and true if survey is active today", async () => {
        const todayAsString = "2021-03-15T00:00:00"
        mockGetSurveyDays.mockImplementation(() => {
            return Promise.resolve([todayAsString]);
        });

        const response: Response = await request.get("/api/instruments/OPN2101A/active");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual(true);
    });

    // it("should return a 200 status and a json list of 2 items when API returns a 2 item list", async () => {
    //     mockGetSurveyDays.mockImplementation(() => {
    //         return Promise.resolve(
    //             ["2021-10-05T00:00:00", "2021-10-06T00:00:00"]);
    //     });
    //
    //     const response: Response = await request.get("/api/instruments/OPN2101A/surveydays");
    //
    //     expect(response.status).toEqual(200);
    //     expect(response.body).toStrictEqual(["2021-10-05T00:00:00", "2021-10-06T00:00:00"]);
    //     expect(response.body.length).toStrictEqual(2);
    // });
    //
    // it("should return a 500 status direct from the API", async () => {
    //     mockGetSurveyDays.mockImplementation(() => {
    //         return Promise.reject();
    //     });
    //
    //     const response: Response = await request.get("/api/instruments/OPN2101A/surveydays");
    //
    //     expect(response.status).toEqual(500);
    // });
});

// function today(): number {
//     return new Date().setHours(0, 0, 0, 0);
// }
