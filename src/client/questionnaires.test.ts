import { cleanup } from "@testing-library/react";
import { questionnaireList, opnQuestionnaire } from "../features/step_definitions/helpers/apiMockObjects";
import {
    getQuestionnaire,
    deleteQuestionnaire,
    activateQuestionnaire,
    deactivateQuestionnaire,
    getQuestionnaires,
    getQuestionnaireModes,
    installQuestionnaire,
    getQuestionnaireSettings,
    getQuestionnaireCaseIds,
    getSurveyDays, surveyIsActive
} from "./questionnaires";

import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const mock = new MockAdapter(axios);

describe("Function getQuestionnaire(questionnaireName: string) ", () => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });

    it("should return true and the questionnaire object if object with the correct name returned", async () => {
        mock.onGet("/api/questionnaires/OPN2004A").reply(200, opnQuestionnaire);

        const questionnaire = await getQuestionnaire("OPN2004A");
        expect(questionnaire).toEqual(opnQuestionnaire);
    });

    it("should return undefined if a 404 is returned from the server", async () => {
        mock.onGet("/api/questionnaires/OPN2004A").reply(404, {});

        const questionnaire = await getQuestionnaire("OPN2004A");
        expect(questionnaire).toBeUndefined();
    });

    it("should throw an error if request returns an error code", async () => {
        mock.onGet("/api/questionnaires/OPN2004A").reply(500, {});

        await expect(getQuestionnaire("OPN2004A")).rejects.toThrow();
    });

    it("should thrown an error if request call fails", async () => {
        mock.onGet("/api/questionnaires/OPN2004A").networkError();

        await expect(getQuestionnaire("OPN2004A")).rejects.toThrow();
    });
});

describe("Function getQuestionnaire(filename: string) ", () => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });

    it("should return true with data if the list is returned successfully", async () => {
        mock.onGet("/api/questionnaires").reply(200, questionnaireList);

        const questionnaires = await getQuestionnaires();
        expect(questionnaires).toEqual(questionnaires);
    });

    it("should throw an error if a 404 is returned from the server", async () => {
        mock.onGet("/api/questionnaires").reply(404, []);

        await expect(getQuestionnaires()).rejects.toThrow();
    });

    it("should throw an error if request returns an error code", async () => {
        mock.onGet("/api/questionnaires").reply(500, []);

        await expect(getQuestionnaires()).rejects.toThrow();
    });

    it("should throw an error if request call fails", async () => {
        mock.onGet("/api/questionnaires").networkError();

        await expect(getQuestionnaires()).rejects.toThrow();
    });
});

describe("Function deleteQuestionnaire(questionnaireName: string) ", () => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });

    it("should return true if created 204 response is returned", async () => {
        mock.onDelete("/api/questionnaires/OPN2004A").reply(204);

        const success = await deleteQuestionnaire("OPN2004A");
        expect(success).toBeTruthy();
    });

    it("should return false if a 404 is returned from the server", async () => {
        mock.onDelete("/api/questionnaires/OPN2004A").reply(404);

        const success = await deleteQuestionnaire("OPN2004A");
        expect(success).toBeFalsy();
    });

    it("should return false if request returns an error code", async () => {
        mock.onDelete("/api/questionnaires/OPN2004A").reply(500);

        const success = await deleteQuestionnaire("OPN2004A");
        expect(success).toBeFalsy();
    });

    it("should return false object if request call fails", async () => {
        mock.onDelete("/api/questionnaires/OPN2004A").networkError();

        const success = await deleteQuestionnaire("OPN2004A");
        expect(success).toBeFalsy();
    });
});

describe("Function activateQuestionnaire(questionnaireName: string) ", () => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });

    it("should return true if created 204 response is returned", async () => {
        mock.onPatch("/api/questionnaires/OPN2004A/activate").reply(204);

        const success = await activateQuestionnaire("OPN2004A");
        expect(success).toBeTruthy();
    });

    it("should return false if a 404 is returned from the server", async () => {
        mock.onPatch("/api/questionnaires/OPN2004A/activate").reply(404);

        const success = await activateQuestionnaire("OPN2004A");
        expect(success).toBeFalsy();
    });

    it("should return false if request returns an error code", async () => {
        mock.onPatch("/api/questionnaires/OPN2004A/activate").reply(500);

        const success = await activateQuestionnaire("OPN2004A");
        expect(success).toBeFalsy();
    });

    it("should return false object if request call fails", async () => {
        mock.onPatch("/api/questionnaires/OPN2004A/activate").networkError();

        const success = await activateQuestionnaire("OPN2004A");
        expect(success).toBeFalsy();
    });
});

describe("Function deactivateQuestionnaire(questionnaireName: string) ", () => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });

    it("should return true if created 204 response is returned", async () => {
        mock.onPatch("/api/questionnaires/OPN2004A/deactivate").reply(204);

        const success = await deactivateQuestionnaire("OPN2004A");
        expect(success).toBeTruthy();
    });

    it("should return false if a 404 is returned from the server", async () => {
        mock.onPatch("/api/questionnaires/OPN2004A/deactivate").reply(404);

        const success = await deactivateQuestionnaire("OPN2004A");
        expect(success).toBeFalsy();
    });

    it("should return false if request returns an error code", async () => {
        mock.onPatch("/api/questionnaires/OPN2004A/deactivate").reply(500);

        const success = await deactivateQuestionnaire("OPN2004A");
        expect(success).toBeFalsy();
    });

    it("should return false object if request call fails", async () => {
        mock.onPatch("/api/questionnaires/OPN2004A/deactivate").networkError();

        const success = await deactivateQuestionnaire("OPN2004A");
        expect(success).toBeFalsy();
    });
});

describe("Function installQuestionnaire(questionnaireName: string) ", () => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });

    it("should return true if created 201 response is returned", async () => {
        mock.onPost("/api/install").reply(201, { filename: "OPN2004A" });

        const success = await installQuestionnaire("OPN2004A");
        expect(success).toBeTruthy();
    });

    it("should return false if a 404 is returned from the server", async () => {
        mock.onPost("/api/install").reply(404, {});

        const success = await installQuestionnaire("OPN2004A");
        expect(success).toBeFalsy();
    });

    it("should return false if request returns an error code", async () => {
        mock.onPost("/api/install").reply(500, {});

        const success = await installQuestionnaire("OPN2004A");
        expect(success).toEqual(false);
    });

    it("should return false object if request call fails", async () => {
        mock.onPost("/api/install").networkError();

        const success = await installQuestionnaire("OPN2004A");
        expect(success).toEqual(false);
    });
});

describe("Function getQuestionnaireModes(questionnaireName: string)", () => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });

    it("should return true if created 200 response is returned", async () => {
        mock.onGet("/api/questionnaires/OPN2004A/modes").reply(200, ["CAWI", "CATI"]);

        const modes = await getQuestionnaireModes("OPN2004A");
        expect(modes).toEqual(["CAWI", "CATI"]);
    });

    it("should throw an error if a 404 is returned from the server", async () => {
        mock.onGet("/api/questionnaires/OPN2004A/modes").reply(404, []);

        await expect(getQuestionnaireModes("OPN2004A")).rejects.toThrow();
    });

    it("should throw an error if request returns an error code", async () => {
        mock.onGet("/api/questionnaires/OPN2004A/modes").reply(500, []);

        await expect(getQuestionnaireModes("OPN2004A")).rejects.toThrow();
    });

    it("should throw an error object if request call fails", async () => {
        mock.onGet("/api/questionnaires/OPN2004A/modes").networkError();

        await expect(getQuestionnaireModes("OPN2004A")).rejects.toThrow();
    });
});

describe("Function getQuestionnaireSettings(questionnaireName: string)", () => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });

    it("should return true if created 200 response is returned", async () => {
        mock.onGet("/api/questionnaires/OPN2004A/settings").reply(200, []);

        const settings = await getQuestionnaireSettings("OPN2004A");
        expect(settings).toEqual([]);
    });

    it("should throw an error if a 404 is returned from the server", async () => {
        mock.onGet("/api/questionnaires/OPN2004A/settings").reply(404, []);

        await expect(getQuestionnaireSettings("OPN2004A")).rejects.toThrow();
    });

    it("should throw an error if request returns an error code", async () => {
        mock.onGet("/api/questionnaires/OPN2004A/settings").reply(500, []);

        await expect(getQuestionnaireSettings("OPN2004A")).rejects.toThrow();
    });

    it("should throw an error object if request call fails", async () => {
        mock.onGet("/api/questionnaires/OPN2004A/settings").networkError();

        await expect(getQuestionnaireSettings("OPN2004A")).rejects.toThrow();
    });
});

describe("Function getQuestionnaireCaseIds(questionnaireName: string) ", () => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });

    it("should return true with data if the list is returned successfully", async () => {
        mock.onGet("/api/questionnaires/OPN2004A/cases/ids").reply(200, []);

        const caseIDs = await getQuestionnaireCaseIds("OPN2004A");
        expect(caseIDs).toEqual([]);
    });

    it("should throw an error if a 404 is returned from the server", async () => {
        mock.onGet("/api/questionnaires/OPN2004A/cases/ids").reply(404, []);

        await expect(getQuestionnaireCaseIds("OPN2004A")).rejects.toThrow();
    });

    it("should throw an error if request returns an error code", async () => {
        mock.onGet("/api/questionnaires/OPN2004A/cases/ids").reply(500, []);

        await expect(getQuestionnaireCaseIds("OPN2004A")).rejects.toThrow();
    });

    it("should throw an error if request call fails", async () => {
        mock.onGet("/api/questionnaires/OPN2004A/cases/ids").networkError();

        await expect(getQuestionnaireCaseIds("OPN2004A")).rejects.toThrow();
    });
});

describe("Function getSurveyDays(questionnaireName: string)", () => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });

    it("should return true if created 200 response is returned", async () => {
        mock.onGet("/api/questionnaires/OPN2004A/surveydays").reply(200, ["2021-10-05T00:00:00", "2021-10-06T00:00:00"]);

        const surveyDays = await getSurveyDays("OPN2004A");
        expect(surveyDays).toEqual(["2021-10-05T00:00:00", "2021-10-06T00:00:00"]);
    });

    it("should throw an error if a 404 is returned from the server", async () => {
        mock.onGet("/api/questionnaires/OPN2004A/surveydays").reply(404, []);

        await expect(getSurveyDays("OPN2004A")).rejects.toThrow();
    });

    it("should throw an error if request returns an error code", async () => {
        mock.onGet("/api/questionnaires/OPN2004A/surveydays").reply(500, []);

        await expect(getSurveyDays("OPN2004A")).rejects.toThrow();
    });

    it("should throw an error object if request call fails", async () => {
        mock.onGet("/api/questionnaires/OPN2004A/surveydays").networkError();

        await expect(getSurveyDays("OPN2004A")).rejects.toThrow();
    });
});

describe("Function surveyIsActive(questionnaireName: string)", () => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });

    it("should return true and 200 response", async () => {
        mock.onGet("/api/questionnaires/OPN2004A/active").reply(200, true);

        const surveyActiveStatus = await surveyIsActive("OPN2004A");
        expect(surveyActiveStatus).toEqual(true);
    });

    it("should throw an error if a 404 is returned from the server", async () => {
        mock.onGet("/api/questionnaires/OPN2004A/active").reply(404, []);

        await expect(surveyIsActive("OPN2004A")).rejects.toThrow();
    });

    it("should throw an error if request returns an error code", async () => {
        mock.onGet("/api/questionnaires/OPN2004A/active").reply(500, []);

        await expect(surveyIsActive("OPN2004A")).rejects.toThrow();
    });

    it("should throw an error object if request call fails", async () => {
        mock.onGet("/api/questionnaires/OPN2004A/active").networkError();

        await expect(getSurveyDays("OPN2004A")).rejects.toThrow();
    });
});

