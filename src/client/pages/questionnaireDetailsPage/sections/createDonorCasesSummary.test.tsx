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

    const { getByText } = render(<CreateDonorCasesSummary {...props} />);

    expect(getByText(/Donor cases created successfully for IPS Manager/i)).toBeInTheDocument();
    expect(getByText(/Success/i)).toBeInTheDocument();
  });

  it("displays an error message when receiving a failed response from the cloud function", () => {
    const props = {
      donorCasesResponseMessage: "Internal Server Error",
      donorCasesStatusCode: 500,
      role: "IPS Manager",
    };

    const { getByText } = render(<CreateDonorCasesSummary {...props} />);

    expect(getByText(/Error creating donor cases for IPS Manager/i)).toBeInTheDocument();
    expect(getByText(/Internal Server Error/i)).toBeInTheDocument();
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
