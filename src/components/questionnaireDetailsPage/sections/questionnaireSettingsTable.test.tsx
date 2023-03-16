/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import QuestionnaireSettingsTable from "./questionnaireSettingsTable";
import { QuestionnaireSettings } from "blaise-api-node-client";

const viewQuestionnaireSettingsFailedMessage = /Failed to get questionnaire settings/i;

describe("Questionnaire settings table", () => {
    const questionnaireSettingsValid: QuestionnaireSettings = {
        type: "StrictInterviewing",
        saveSessionOnTimeout: true,
        saveSessionOnQuit: true,
        deleteSessionOnTimeout: true,
        deleteSessionOnQuit: true,
        sessionTimeout: 15,
        applyRecordLocking: true
    };

    const questionnaireSettingsInvalid: QuestionnaireSettings = {
        type: "StrictInterviewing",
        saveSessionOnTimeout: false,
        saveSessionOnQuit: true,
        deleteSessionOnTimeout: false,
        deleteSessionOnQuit: false,
        sessionTimeout: 15,
        applyRecordLocking: false
    };

    const invalidSettings: Partial<QuestionnaireSettings> = {
        saveSessionOnTimeout: true,
        deleteSessionOnQuit: true,
        deleteSessionOnTimeout: true,
        applyRecordLocking: true
    };

    describe("when the page errors", () => {
        it("renders the error component", async () => {
            render(
                <QuestionnaireSettingsTable errored={true} questionnaireSettings={undefined} invalidSettings={{}} />
            );

            await waitFor(() => {
                expect(screen.getByText(viewQuestionnaireSettingsFailedMessage)).toBeDefined();
            });
        });
    });

    describe("all the settings are valid", () => {
        it("renders the expected settings", async () => {
            render(
                <QuestionnaireSettingsTable errored={false} questionnaireSettings={questionnaireSettingsValid} invalidSettings={{}} />
            );

            await waitFor(() => {
                expect(screen.getByText(/Questionnaire settings/i)).toBeDefined();
                expect(screen.getByText(/Type/i)).toBeDefined();
                expect(screen.getByText(/SaveSessionOnQuit/i)).toBeDefined();
                expect(screen.getByText(/SessionTimeout/i)).toBeDefined();
            });
        });
    });

    describe("some of the settings are invalid", () => {
        it("renders the expected settings and highlights invalid fields", async () => {
            render(
                <QuestionnaireSettingsTable errored={false} questionnaireSettings={questionnaireSettingsInvalid} invalidSettings={invalidSettings} />
            );

            await waitFor(() => {
                expect(screen.getByText(/Questionnaire settings/i)).toBeDefined();
                expect(screen.getByText(/Type/i)).toBeDefined();
                expect(screen.getByText(/SaveSessionOnQuit/i)).toBeDefined();
                expect(screen.getByText(/SessionTimeout/i)).toBeDefined();
                expect(screen.getByText(/SaveSessionOnTimeout should be True/i)).toBeDefined();
                expect(screen.getByText(/DeleteSessionOnTimeout should be True/i)).toBeDefined();
                expect(screen.getByText(/DeleteSessionOnQuit should be True/i)).toBeDefined();
                expect(screen.getByText(/ApplyRecordLocking should be True/i)).toBeDefined();
            });
        });
    });
});
