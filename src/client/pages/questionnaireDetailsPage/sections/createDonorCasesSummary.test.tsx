import { render, screen } from "@testing-library/react";

import "@testing-library/jest-dom/vitest";
import { CreateDonorCasesSummary } from "./createDonorCasesSummary";

describe("CreateDonorCasesSummary", () => {
  it("displays a success message when receiving a successful response from the cloud function", () => {
    const props = {
      donorCasesResponseMessage: "Success",
      donorCasesStatusCode: 200,
      role: "IPS Manager",
    };

    render(<CreateDonorCasesSummary {...props} />);

    expect(
      screen.getByRole("heading", { name: /Donor cases created successfully for IPS Manager/i }),
    ).toBeInTheDocument();
  });

  it("shows self-service guidance for the no-users-in-role error", () => {
    const props = {
      donorCasesResponseMessage:
        "\"Error creating IPS donor cases: No users found with role 'IPS Manager'\"",
      donorCasesStatusCode: 500,
      role: "IPS Manager",
    };

    render(<CreateDonorCasesSummary {...props} />);

    expect(
      screen.getByRole("heading", { name: /Error creating donor cases for IPS Manager/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Error creating IPS donor cases: No users found with role 'IPS Manager'"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        "\"Error creating IPS donor cases: No users found with role 'IPS Manager'\"",
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/Add a user to this role and try creating donor cases again\./i),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Service Desk/i })).not.toBeInTheDocument();
  });

  it("shows Service Desk guidance for other donor case errors", () => {
    const props = {
      donorCasesResponseMessage: '"Internal Server Error"',
      donorCasesStatusCode: 500,
      role: "IPS Manager",
    };

    render(<CreateDonorCasesSummary {...props} />);

    expect(
      screen.getByRole("heading", { name: /Error creating donor cases for IPS Manager/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Internal Server Error")).toBeInTheDocument();
    expect(screen.queryByText('"Internal Server Error"')).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Service Desk/i })).toHaveAttribute(
      "href",
      "https://ons.service-now.com/",
    );
    expect(
      screen.getByText(
        /include the questionnaire name, user role, and the date and time of failure\./i,
      ),
    ).toBeInTheDocument();
  });
});
