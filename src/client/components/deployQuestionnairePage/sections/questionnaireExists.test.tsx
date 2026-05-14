import "@testing-library/jest-dom/vitest";
import React from "react";
import { render, screen } from "@testing-library/react";

import { QuestionnaireExists } from "./questionnaireExists";

vi.mock("blaise-design-system-react-components", () => ({
  StyledFormErrorSummary: () => <div data-testid="error-summary" />,
}));

describe("QuestionnaireExists", () => {
  it("renders the overwrite heading", () => {
    render(<QuestionnaireExists questionnaireName="OPN2004A" />);

    expect(
      screen.getByText(
        (_, element) =>
          (element?.textContent ?? "").includes(
            "Questionnaire OPN2004A already exists.Do you want to overwrite it?",
          ),
        { selector: "h1" },
      ),
    ).toBeInTheDocument();
  });
});