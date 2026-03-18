/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

jest.mock("../breadcrumbs", () => () => null);
jest.mock("./sections/blaiseNodeInfo", () => () => null);
jest.mock("./sections/cawiModeDetails", () => () => null);
jest.mock("./sections/catiModeDetails", () => () => null);
jest.mock("./sections/totalmobileDetails", () => () => null);
jest.mock("./sections/yearCalendar", () => () => null);
jest.mock("./sections/questionnaireSettingsSection", () => () => null);
jest.mock("./sections/questionnaireDetails", () => () => null);
jest.mock("./sections/createDonorCases", () => () => null);
jest.mock("../createDonorCasePage/createDonorCasesSummary", () => () => null);
jest.mock("./sections/reissueNewDonorCase", () => () => null);
jest.mock("../reissueNewDonorCasePage/reissueNewDonorCaseSummary", () => () => null);

import QuestionnaireDetailsPage from "./questionnaireDetailsPage";

import { getQuestionnaire, getQuestionnaireModes, getSurveyDays } from "../../client/questionnaires";

jest.mock("../../client/questionnaires", () => ({
    getQuestionnaire: jest.fn(),
    getQuestionnaireModes: jest.fn(),
    getSurveyDays: jest.fn(),
}));

const mockInfo = jest.fn();
const mockError = jest.fn();

jest.mock("../../client/logger", () => ({
    clientLogger: {
        info: (...args: any[]) => mockInfo(...args),
        error: (...args: any[]) => mockError(...args),
        warn: jest.fn(),
        debug: jest.fn(),
    },
}));

function renderAt(pathname: string, state?: any) {
    return render(
        <MemoryRouter initialEntries={[{ pathname, state }]}>
            <Routes>
                <Route path="/questionnaire/:questionnaireName" element={<QuestionnaireDetailsPage />} />
            </Routes>
        </MemoryRouter>
    );
}

describe("QuestionnaireDetailsPage logging", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("logs when questionnaire loads", async () => {
        (getQuestionnaire as jest.Mock).mockResolvedValue({ name: "OPN2004A", dataRecordCount: 1 });
        (getQuestionnaireModes as jest.Mock).mockResolvedValue(["CAWI"]);

        renderAt("/questionnaire/OPN2004A", undefined);

        await waitFor(() => {
            expect(mockInfo).toHaveBeenCalledWith("Loaded questionnaire: OPN2004A");
        });
    });

    it("logs when questionnaire modes are empty", async () => {
        (getQuestionnaire as jest.Mock).mockResolvedValue({ name: "OPN2004A", dataRecordCount: 1 });
        (getQuestionnaireModes as jest.Mock).mockResolvedValue([]);

        renderAt("/questionnaire/OPN2004A", undefined);

        await waitFor(() => {
            expect(mockError).toHaveBeenCalledWith("returned questionnaire mode was empty");
        });

        expect(screen.getByText(/Could not get questionnaire details/i)).toBeDefined();
    });

    it("logs when CATI survey days are returned", async () => {
        (getQuestionnaire as jest.Mock).mockResolvedValue({ name: "OPN2004A", dataRecordCount: 1 });
        (getQuestionnaireModes as jest.Mock).mockResolvedValue(["CATI"]);
        (getSurveyDays as jest.Mock).mockResolvedValue(["Monday"]);

        renderAt("/questionnaire/OPN2004A", undefined);

        await waitFor(() => {
            expect(mockInfo).toHaveBeenCalledWith("returned questionnaire survey days: Monday");
        });
    });

    it("logs when questionnaire load fails", async () => {
        (getQuestionnaire as jest.Mock).mockRejectedValue(new Error("nope"));
        (getQuestionnaireModes as jest.Mock).mockResolvedValue(["CAWI"]);

        renderAt("/questionnaire/OPN2004A", undefined);

        await waitFor(() => {
            expect(mockInfo).toHaveBeenCalled();
        });

        expect(screen.getByText(/Could not get questionnaire details/i)).toBeDefined();
    });
});
