/**
 * @jest-environment jsdom
 */

import { deployQuestionnaireAndSetNoTOStartDate, selectNoReleaseDate } from "../../../features/step_definitions/helpers/functions";
import { screen } from "@testing-library/react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import '@testing-library/jest-dom/extend-expect';

const mock = new MockAdapter(axios);

import { AuthManager } from "blaise-login-react-client";

jest.mock("blaise-login-react-client");
AuthManager.prototype.loggedIn = jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
});

describe("Deploy form summary page", () => {
    const LMSQuestionnaire = "LMS2004A.bpkg"
    const OPNQuestionnaire = "OPN2004A.bpkg"

    it("should display the questionnaire file name", async () => {
        await deployQuestionnaireAndSetNoTOStartDate(LMSQuestionnaire);
        await selectNoReleaseDate();

        expect(screen.getByText(/Questionnaire file name/i)).toBeDefined();
    });

    it("should display when the file was last modified", async () => {
        await deployQuestionnaireAndSetNoTOStartDate(LMSQuestionnaire);
        await selectNoReleaseDate();

        expect(screen.getByText(/Questionnaire file last modified date/i)).toBeDefined();
    });

    it("should display the questionnaire file size", async () => {
        await deployQuestionnaireAndSetNoTOStartDate(LMSQuestionnaire);
        await selectNoReleaseDate();

        expect(screen.getByText(/Questionnaire file size/i)).toBeDefined();
    });

    it("should display if the questionnaire exists in Blaise", async () => {
        await deployQuestionnaireAndSetNoTOStartDate(LMSQuestionnaire);
        await selectNoReleaseDate();

        expect(screen.getByText(/Does the questionnaire already exist in blaise?/i)).toBeDefined();
    });

    it("should display the telephone operation start date", async () => {
        await deployQuestionnaireAndSetNoTOStartDate(LMSQuestionnaire);
        await selectNoReleaseDate();

        expect(screen.getByText(/Set a telephone operations start date for questionnaire?/i)).toBeDefined();
    });

    it("should display the totalmobile release date for LMS questionnaires", async () => {
        await deployQuestionnaireAndSetNoTOStartDate(LMSQuestionnaire);
        await selectNoReleaseDate();

        expect(screen.getByText(/Set a totalmobile release date for questionnaire?/i)).toBeDefined();
    });

    it("should not display the totalmobile release date for non-LMS questionnaires", async () => {
        await deployQuestionnaireAndSetNoTOStartDate(OPNQuestionnaire);

        expect(screen.queryByText(/Set a totalmobile release date for questionnaire?/i)).not.toBeInTheDocument();
    });
});
