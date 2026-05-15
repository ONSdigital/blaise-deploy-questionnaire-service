import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { DeploymentOutcome } from "./deploymentOutcome";

describe("DeploymentOutcome", () => {
  it("renders the success state and view button", () => {
    const onViewQuestionnaires = vi.fn();

    render(
      <DeploymentOutcome
        questionnaireName="OPN2004A"
        status=""
        onViewQuestionnaires={onViewQuestionnaires}
      />,
    );

    expect(
      screen.getByText(
        (_, element) =>
          (element?.textContent ?? "").includes("Questionnaire OPN2004A deployed successfully"),
        { selector: "h1" },
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Return to deploy questionnaire/i }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /View questionnaires/i }));

    expect(onViewQuestionnaires).toHaveBeenCalledTimes(1);
  });

  it("renders the failure state with a retry button when provided", () => {
    const onRetry = vi.fn();
    const onViewQuestionnaires = vi.fn();

    render(
      <DeploymentOutcome
        questionnaireName="OPN2004A"
        status="Failed to upload questionnaire"
        onRetry={onRetry}
        onViewQuestionnaires={onViewQuestionnaires}
      />,
    );

    expect(
      screen.getByText(
        (_, element) =>
          (element?.textContent ?? "").includes("Questionnaire OPN2004A deploy failed"),
        { selector: "h1" },
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/Reason: Failed to upload questionnaire/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Return to deploy questionnaire/i }));
    fireEvent.click(screen.getByRole("button", { name: /View questionnaires/i }));

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onViewQuestionnaires).toHaveBeenCalledTimes(1);
  });
});
