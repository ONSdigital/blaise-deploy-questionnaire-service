import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

import { InvalidSettings } from "./invalidSettings";

const { mockQuestionnaireSettings } = vi.hoisted(() => ({
  mockQuestionnaireSettings: vi.fn(),
}));

vi.mock("../../shared/questionnaireSettings", () => ({
  QuestionnaireSettings: (props: unknown) => {
    mockQuestionnaireSettings(props);

    return <div data-testid="questionnaire-settings" />;
  },
}));

describe("InvalidSettings", () => {
  afterEach(() => {
    mockQuestionnaireSettings.mockClear();
  });

  it("renders the guidance message and passes settings through to the shared component", () => {
    const questionnaireSettings = {
      type: "StrictInterviewing",
      saveSessionOnTimeout: true,
      saveSessionOnQuit: false,
      deleteSessionOnTimeout: false,
      deleteSessionOnQuit: false,
      sessionTimeout: 15,
      applyRecordLocking: false,
    };
    const invalidSettings = {
      saveSessionOnQuit: true,
    };

    render(
      <InvalidSettings
        questionnaireName="OPN2004A"
        questionnaireSettings={questionnaireSettings}
        invalidSettings={invalidSettings}
        errored={true}
      />,
    );

    expect(
      screen.getByText(
        (_, element) =>
          (element?.textContent ?? "").includes(
            "Questionnaire settings for OPN2004A do not match recommendations",
          ),
        { selector: "h1" },
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/This questionnaire does not match the recommended settings/i),
    ).toBeInTheDocument();
    expect(screen.getByTestId("questionnaire-settings")).toBeInTheDocument();
    expect(mockQuestionnaireSettings).toHaveBeenCalledWith({
      questionnaireSettings,
      invalidSettings,
      errored: true,
    });
  });
});
