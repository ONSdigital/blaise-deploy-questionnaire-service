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
    expect(screen.getByRole("link", { name: /Service Desk/i })).toHaveAttribute(
      "href",
      "https://ons.service-now.com/",
    );
    expect(screen.getByText(/Details: Failed to upload questionnaire/i)).toBeInTheDocument();
    expect(
      screen.getByText(/include the questionnaire name and the date and time of failure\./i),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Return to deploy questionnaire/i }));
    fireEvent.click(screen.getByRole("button", { name: /View questionnaires/i }));

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onViewQuestionnaires).toHaveBeenCalledTimes(1);
  });
});
