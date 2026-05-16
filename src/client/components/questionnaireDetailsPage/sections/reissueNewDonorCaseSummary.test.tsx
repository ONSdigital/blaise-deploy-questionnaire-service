import { render, screen } from "@testing-library/react";

import "@testing-library/jest-dom/vitest";
import { ReissueNewDonorCaseSummary } from "./reissueNewDonorCaseSummary";

describe("ReissueNewDonorCaseSummary", () => {
  it("displays a success message when receiving a successful response from the cloud function", () => {
    const props = {
      responseMessage: "Success",
      statusCode: 200,
      user: "testuser1",
    };

    const { getByText } = render(<ReissueNewDonorCaseSummary {...props} />);

    expect(getByText(/Reissued donor case successfully for testuser1/i)).toBeInTheDocument();
    expect(getByText(/Success/i)).toBeInTheDocument();
  });

  it("displays an error message when receiving a failed response from the cloud function", () => {
    const props = {
      responseMessage: "Internal Server Error",
      statusCode: 500,
      user: "testuser1",
    };

    const { getByText } = render(<ReissueNewDonorCaseSummary {...props} />);

    expect(getByText(/Error reissuing donor case for testuser1/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Service Desk/i })).toHaveAttribute(
      "href",
      "https://ons.service-now.com/",
    );
    expect(
      screen.getByText(
        /include the questionnaire name, username, and the date and time of failure\./i,
      ),
    ).toBeInTheDocument();
  });

  it("displays the donor-case guidance when the user has no existing donor cases", () => {
    const props = {
      responseMessage: "User has no existing donor cases.",
      statusCode: 500,
      user: "testuser1",
    };

    const { getByText } = render(<ReissueNewDonorCaseSummary {...props} />);

    expect(getByText(/User has not been issued with an initial donor case/i)).toBeInTheDocument();
  });
});
