import { render, screen, waitFor } from "@testing-library/react";

import { QuestionnaireSettings } from "./questionnaireSettings";

import type { QuestionnaireSettings as QuestionnaireSettingsType } from "blaise-api-node-client";

const viewQuestionnaireSettingsFailedMessage = /Failed to get questionnaire settings/i;

describe("Questionnaire settings table", () => {
  const questionnaireSettingsValid: QuestionnaireSettingsType = {
    type: "StrictInterviewing",
    saveSessionOnTimeout: true,
    saveSessionOnQuit: true,
    deleteSessionOnTimeout: true,
    deleteSessionOnQuit: true,
    sessionTimeout: 15,
    applyRecordLocking: true,
  };

  const questionnaireSettingsInvalid: QuestionnaireSettingsType = {
    type: "StrictInterviewing",
    saveSessionOnTimeout: false,
    saveSessionOnQuit: true,
    deleteSessionOnTimeout: false,
    deleteSessionOnQuit: false,
    sessionTimeout: 15,
    applyRecordLocking: false,
  };

  const invalidSettings: Partial<QuestionnaireSettingsType> = {
    saveSessionOnTimeout: true,
    deleteSessionOnQuit: true,
    deleteSessionOnTimeout: true,
    applyRecordLocking: true,
  };

  describe("when the page errors", () => {
    it("renders the error component", async () => {
      render(
        <QuestionnaireSettings
          errored={true}
          questionnaireSettings={undefined}
          invalidSettings={{}}
        />,
      );

      await waitFor(() => {
        expect(screen.getByText(viewQuestionnaireSettingsFailedMessage)).toBeDefined();
      });
    });
  });

  describe("all the settings are valid", () => {
    it("renders the expected settings", async () => {
      render(
        <QuestionnaireSettings
          errored={false}
          questionnaireSettings={questionnaireSettingsValid}
          invalidSettings={{}}
        />,
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
        <QuestionnaireSettings
          errored={false}
          questionnaireSettings={questionnaireSettingsInvalid}
          invalidSettings={invalidSettings}
        />,
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
