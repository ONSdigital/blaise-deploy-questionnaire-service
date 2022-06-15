import supertest, { Response } from "supertest";
import {
    questionnaireListMockObject, questionnaireMockObject, expectedQuestionnaireList
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
const mockGetQuestionnaire = jest.fn();
const mockGetQuestionnaires = jest.fn();
const mockInstallQuestionnaire = jest.fn();
const mockDeleteQuestionnaire = jest.fn();
const mockActivateQuestionnaire = jest.fn();
const mockDeactivateQuestionnaire = jest.fn();
const mockDoesQuestionnaireHaveMode = jest.fn();
const mockGetQuestionnaireModes = jest.fn();
const mockGetQuestionnaireSettings = jest.fn();
const mockGetSurveyDays = jest.fn();


jest.mock("blaise-api-node-client", () => {
    return {
        __esModule: true,
        ...(jest.requireActual("blaise-api-node-client")),
        default: jest.fn().mockImplementation(() => {
            return {
                getDiagnostics: mockGetDiagnostics,
                getQuestionnaire: mockGetQuestionnaire,
                getQuestionnaires: mockGetQuestionnaires,
                installQuestionnaire: mockInstallQuestionnaire,
                deleteQuestionnaire: mockDeleteQuestionnaire,
                activateQuestionnaire: mockActivateQuestionnaire,
                deactivateQuestionnaire: mockDeactivateQuestionnaire,
                doesQuestionnaireHaveMode: mockDoesQuestionnaireHaveMode,
                getQuestionnaireModes: mockGetQuestionnaireModes,
                getQuestionnaireSettings: mockGetQuestionnaireSettings,
                getSurveyDays: mockGetSurveyDays
            };
        })
    };
});

const { DiagnosticMockObject, QuestionnaireSettingsMockList } = jest.requireActual("blaise-api-node-client");

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

describe("BlaiseAPI Get all questionnaires from API", () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should return a 200 status and an empty json list when API returns a empty list", async () => {
        mockGetQuestionnaires.mockImplementation(() => {
            return Promise.resolve([]);
        });

        const response: Response = await request.get("/api/questionnaires");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual([]);
    });

    it("should return a 200 status and a json list of 3 items when API returns a 3 item list", async () => {
        mockGetQuestionnaires.mockImplementation(() => {
            return Promise.resolve(questionnaireListMockObject);
        });

        const response: Response = await request.get("/api/questionnaires");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual(expectedQuestionnaireList);
        expect(response.body.length).toStrictEqual(3);
    });

    it("should return a 500 status direct from the API", async () => {
        mockGetQuestionnaires.mockImplementation(() => {
            return Promise.reject();
        });

        const response: Response = await request.get("/api/questionnaires");

        expect(response.status).toEqual(500);
    });
});

describe("BlaiseAPI Get specific questionnaire information from API", () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should return a 404 status with the data as false when API returns can't find the questionnaire", async () => {
        mockGetQuestionnaire.mockImplementation(() => {
            return Promise.reject({ response: { status: 404 }, isAxiosError: true });
        });

        const response: Response = await request.get("/api/questionnaires/OPN2004A");

        expect(response.status).toEqual(404);
        expect(response.body).toEqual("");

    });

    it("should return a 200 status and a json object when API returns a questionnaire object", async () => {
        mockGetQuestionnaire.mockImplementation(() => {
            return Promise.resolve(questionnaireMockObject);
        });

        const response: Response = await request.get("/api/questionnaires/OPN2101A");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual(questionnaireMockObject);
    });

    it("should return a 500 status direct from the API", async () => {
        mockGetQuestionnaire.mockImplementation(() => {
            return Promise.reject();
        });

        const response: Response = await request.get("/api/questionnaires/OPN2101A");

        expect(response.status).toEqual(500);
    });
});

describe("BlaiseAPI Post to API to install a specific questionnaire", () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should return a 201 status when API installs a questionnaire", async () => {
        mockInstallQuestionnaire.mockImplementation(() => {
            return Promise.resolve(true);
        });

        const response: Response = await request.post("/api/install").send({ filename: "OPN2101A" });

        expect(response.status).toEqual(201);
    });

    it("should return a 500 status direct from the API", async () => {
        mockInstallQuestionnaire.mockImplementation(() => {
            return Promise.reject();
        });

        const response: Response = await request.post("/api/install").send({ filename: "OPN2101A" });

        expect(response.status).toEqual(500);
    });
});

describe("BlaiseAPI Delete a specific questionnaire", () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should return a 204 status when API deletes a questionnaire successfuly", async () => {
        mockDeleteQuestionnaire.mockImplementation(() => {
            return Promise.resolve(true);
        });

        const response: Response = await request.delete("/api/questionnaires/OPN2101A");

        expect(response.status).toEqual(204);
    });

    it("should return a 404 status direct from the API", async () => {
        mockDeleteQuestionnaire.mockImplementation(() => {
            return Promise.reject({ response: { status: 404 }, isAxiosError: true });
        });

        const response: Response = await request.delete("/api/questionnaires/OPN2101A");

        expect(response.status).toEqual(404);
    });

    it("should return a 500 status direct from the API", async () => {
        mockDeleteQuestionnaire.mockImplementation(() => {
            return Promise.reject({ response: { status: 500 }, isAxiosError: true });
        });

        const response: Response = await request.delete("/api/questionnaires/OPN2101A");

        expect(response.status).toEqual(500);
    });
});

describe("BlaiseAPI Activate a specific questionnaire", () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should return a 204 status when API activates a questionnaire successfuly", async () => {
        mockActivateQuestionnaire.mockImplementation(() => {
            return Promise.resolve(true);
        });

        const response: Response = await request.patch("/api/questionnaires/OPN2101A/activate");

        expect(response.status).toEqual(204);
    });

    it("should return a 404 status direct from the API", async () => {
        mockActivateQuestionnaire.mockImplementation(() => {
            return Promise.reject({ response: { status: 404 }, isAxiosError: true });
        });

        const response: Response = await request.patch("/api/questionnaires/OPN2101A/activate");

        expect(response.status).toEqual(404);
    });

    it("should return a 500 status direct from the API", async () => {
        mockActivateQuestionnaire.mockImplementation(() => {
            return Promise.reject({ response: { status: 500 }, isAxiosError: true });
        });

        const response: Response = await request.patch("/api/questionnaires/OPN2101A/activate");

        expect(response.status).toEqual(500);
    });
});

describe("BlaiseAPI Deactivate a specific questionnaire", () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should return a 204 status when API activates a questionnaire successfuly", async () => {
        mockDeactivateQuestionnaire.mockImplementation(() => {
            return Promise.resolve(true);
        });

        const response: Response = await request.patch("/api/questionnaires/OPN2101A/deactivate");

        expect(response.status).toEqual(204);
    });

    it("should return a 404 status direct from the API", async () => {
        mockDeactivateQuestionnaire.mockImplementation(() => {
            return Promise.reject({ response: { status: 404 }, isAxiosError: true });
        });

        const response: Response = await request.patch("/api/questionnaires/OPN2101A/deactivate");

        expect(response.status).toEqual(404);
    });

    it("should return a 500 status direct from the API", async () => {
        mockDeactivateQuestionnaire.mockImplementation(() => {
            return Promise.reject({ response: { status: 500 }, isAxiosError: true });
        });

        const response: Response = await request.patch("/api/questionnaires/OPN2101A/deactivate");

        expect(response.status).toEqual(500);
    });
});

describe("BlaiseAPI does questionnaire have a specific mode API", () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should return a 200 status and a json boolean when API returns a boolean", async () => {
        mockDoesQuestionnaireHaveMode.mockImplementation(() => {
            return Promise.resolve(true);
        });

        const response: Response = await request.get("/api/questionnaires/OPN2101A/modes/CAWI");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual(true);
    });

    it("should return a 500 status direct from the API", async () => {
        mockDoesQuestionnaireHaveMode.mockImplementation(() => {
            return Promise.reject(true);
        });

        const response: Response = await request.get("/api/questionnaires/OPN2101A/modes/CAWI");

        expect(response.status).toEqual(500);
    });
});

describe("BlaiseAPI get questionnaire modes", () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should return a 200 status and an empty json list when API returns a empty list", async () => {
        mockGetQuestionnaireModes.mockImplementation(() => {
            return Promise.resolve([]);
        });

        const response: Response = await request.get("/api/questionnaires/OPN2101A/modes");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual([]);
    });

    it("should return a 200 status and a json list of 2 items when API returns a 2 item list", async () => {
        mockGetQuestionnaireModes.mockImplementation(() => {
            return Promise.resolve(["CATI", "CAWI"]);
        });

        const response: Response = await request.get("/api/questionnaires/OPN2101A/modes");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual(["CATI", "CAWI"]);
        expect(response.body.length).toStrictEqual(2);
    });

    it("should return a 500 status direct from the API", async () => {
        mockGetQuestionnaireModes.mockImplementation(() => {
            return Promise.reject();
        });

        const response: Response = await request.get("/api/questionnaires/OPN2101A/modes");

        expect(response.status).toEqual(500);
    });
});

describe("BlaiseAPI get questionnaire settings", () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should return a 200 status and an empty json list when API returns a empty list", async () => {
        mockGetQuestionnaireSettings.mockImplementation(() => {
            return Promise.resolve([]);
        });

        const response: Response = await request.get("/api/questionnaires/OPN2101A/settings");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual([]);
    });

    it("should return a 200 status and a json object when API returns an questionnaire settings object", async () => {
        mockGetQuestionnaireSettings.mockImplementation(() => {
            return Promise.resolve(QuestionnaireSettingsMockList);
        });


        const response: Response = await request.get("/api/questionnaires/OPN2101A/settings");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual(QuestionnaireSettingsMockList);
    });

    it("should return a 500 status direct from the API", async () => {
        mockGetQuestionnaireSettings.mockImplementation(() => {
            return Promise.reject();
        });

        const response: Response = await request.get("/api/questionnaires/OPN2101A/settings");

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

        const response: Response = await request.get("/api/questionnaires/OPN2101A/surveydays");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual([]);
    });

    it("should return a 200 status and a json list of 2 items when API returns a 2 item list", async () => {
        mockGetSurveyDays.mockImplementation(() => {
            return Promise.resolve(
                ["2021-10-05T00:00:00", "2021-10-06T00:00:00"]);
        });

        const response: Response = await request.get("/api/questionnaires/OPN2101A/surveydays");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual(["2021-10-05T00:00:00", "2021-10-06T00:00:00"]);
        expect(response.body.length).toStrictEqual(2);
    });

    it("should return a 500 status direct from the API", async () => {
        mockGetSurveyDays.mockImplementation(() => {
            return Promise.reject();
        });

        const response: Response = await request.get("/api/questionnaires/OPN2101A/surveydays");

        expect(response.status).toEqual(500);
    });
});

describe("BlaiseAPI get survey is active", () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should return a 200 status and true if survey is active today", async () => {
        // const todayAsString = "2021-03-15T00:00:00";
        const todayAsString = new Date().toISOString();
        mockGetSurveyDays.mockImplementation(() => {
            return Promise.resolve([todayAsString]);
        });

        const response: Response = await request.get("/api/questionnaires/OPN2101A/active");

        expect(response.status).toEqual(200);
        expect(response.body).toStrictEqual(true);
    });

    // it("should return a 200 status and a json list of 2 items when API returns a 2 item list", async () => {
    //     mockGetSurveyDays.mockImplementation(() => {
    //         return Promise.resolve(
    //             ["2021-10-05T00:00:00", "2021-10-06T00:00:00"]);
    //     });
    //
    //     const response: Response = await request.get("/api/questionnaires/OPN2101A/surveydays");
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
    //     const response: Response = await request.get("/api/questionnaires/OPN2101A/surveydays");
    //
    //     expect(response.status).toEqual(500);
    // });
});

// function today(): number {
//     return new Date().setHours(0, 0, 0, 0);
// }
