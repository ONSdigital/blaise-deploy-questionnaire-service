/**
 * @jest-environment jsdom
 */
import React from "react";
import flushPromises from "../../../tests/utils";
import { render, screen, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import QuestionnaireSettingsSection from "./questionnaireSettingsSection";
import { opnQuestionnaire } from "../../../features/step_definitions/helpers/apiMockObjects";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { MemoryRouter } from "react-router-dom";

const viewQuestionnaireSettingsFailedMessage = /Failed to get questionnaire settings/i;
const QuestionnaireSettingsMockList = [
    {
        "type": "StrictInterviewing",
        "saveSessionOnTimeout": false,
        "saveSessionOnQuit": true,
        "deleteSessionOnTimeout": false,
        "deleteSessionOnQuit": false,
        "sessionTimeout": 15,
        "applyRecordLocking": false
    }
];

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

describe("Given the API successfully loads the questionnaire mode and settings for CATI only mode", () => {
    beforeEach(() => {
        mock.onGet(`/api/questionnaires/${opnQuestionnaire.name}/settings`).reply(200, QuestionnaireSettingsMockList);
    });

    afterEach(() => {
        mock.reset();
    });

    it("matches Snapshot for the view Questionnaire Settings page", async () => {

        const wrapper = render(
            <MemoryRouter>
                <QuestionnaireSettingsSection questionnaire={opnQuestionnaire} modes={["CATI"]} />
            </MemoryRouter>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(wrapper).toMatchSnapshot();
        });
    });

    it("should render correctly", async () => {
        render(
            <MemoryRouter>
                <QuestionnaireSettingsSection questionnaire={opnQuestionnaire} modes={["CATI"]} />
            </MemoryRouter>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(/Questionnaire settings/i)).toBeDefined();
            expect(screen.getByText(/Type/i)).toBeDefined();
            expect(screen.getByText(/SaveSessionOnQuit/i)).toBeDefined();
            expect(screen.getByText(/SessionTimeout/i)).toBeDefined();
        });
    });

    it("should highlight all invalid fields", async () => {
        render(
            <MemoryRouter>
                <QuestionnaireSettingsSection questionnaire={opnQuestionnaire} modes={["CATI"]} />
            </MemoryRouter>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(/SaveSessionOnTimeout should be True/i)).toBeDefined();
        });
    });
});

describe("Given the API successfully loads the questionnaire mode and settings for mixed mode", () => {
    beforeEach(() => {
        mock.onGet(`/api/questionnaires/${opnQuestionnaire.name}/settings`).reply(200, QuestionnaireSettingsMockList);
    });

    afterEach(() => {
        mock.reset();
    });

    it("matches Snapshot for the view Questionnaire Settings page", async () => {

        const wrapper = render(
            <MemoryRouter>
                <QuestionnaireSettingsSection questionnaire={opnQuestionnaire} modes={["CATI", "CAWI"]} />
            </MemoryRouter>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(wrapper).toMatchSnapshot();
        });
    });

    it("should render correctly", async () => {
        render(
            <MemoryRouter>
                <QuestionnaireSettingsSection questionnaire={opnQuestionnaire} modes={["CATI", "CAWI"]} />
            </MemoryRouter>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(/Questionnaire settings/i)).toBeDefined();
            expect(screen.getByText(/Type/i)).toBeDefined();
            expect(screen.getByText(/SaveSessionOnQuit/i)).toBeDefined();
            expect(screen.getByText(/SessionTimeout/i)).toBeDefined();
        });
    });

    it("should highlight all invalid fields", async () => {
        render(
            <MemoryRouter>
                <QuestionnaireSettingsSection questionnaire={opnQuestionnaire} modes={["CATI", "CAWI"]} />
            </MemoryRouter>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(/SaveSessionOnTimeout should be True/i)).toBeDefined();
            expect(screen.getByText(/DeleteSessionOnTimeout should be True/i)).toBeDefined();
            expect(screen.getByText(/DeleteSessionOnQuit should be True/i)).toBeDefined();
            expect(screen.getByText(/ApplyRecordLocking should be True/i)).toBeDefined();
        });
    });
});

describe("Given the API fails to load the questionnaire mode or settings", () => {
    beforeEach(() => {
        mock.onGet(`/api/questionnaires/${opnQuestionnaire.name}/settings`).reply(500);
    });

    afterEach(() => {
        mock.reset();
    });

    it("should display an error message when it fails to load the Questionnaire Settings", async () => {
        render(
            <QuestionnaireSettingsSection questionnaire={opnQuestionnaire} modes={["CATI"]} />
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(viewQuestionnaireSettingsFailedMessage)).toBeDefined();
        });
    });
});

describe("Given the API returns an empty list for questionnaire mode or settings", () => {
    beforeEach(() => {
        mock.onGet(`/api/questionnaires/${opnQuestionnaire.name}/settings`).reply(200, []);
    });

    afterEach(() => {
        mock.reset();
    });

    it("it should render an error message", async () => {
        render(
            <MemoryRouter>
                <QuestionnaireSettingsSection questionnaire={opnQuestionnaire} modes={[]} />
            </MemoryRouter>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(viewQuestionnaireSettingsFailedMessage)).toBeDefined();
        });
    });
});
