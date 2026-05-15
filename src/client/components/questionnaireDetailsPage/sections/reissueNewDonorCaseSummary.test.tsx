import { render } from "@testing-library/react";

import "@testing-library/jest-dom";
import { ReissueNewDonorCaseSummary } from "./reissueNewDonorCaseSummary";

describe("ReissueNewDonorCaseSummary", () => {
  it("displays a success message when receiving a successful response from the cloud function", () => {
    const props = {
      responseMessage: "Success",
      statusCode: 200,
      role: "testuser1",
    };

    const { getByText } = render(<ReissueNewDonorCaseSummary {...props} />);

    expect(getByText(/Reissued donor case successfully for testuser1/i)).toBeInTheDocument();
    expect(getByText(/Success/i)).toBeInTheDocument();
  });

  it("displays an error message when receiving a failed response from the cloud function", () => {
    const props = {
      responseMessage: "Internal Server Error",
      statusCode: 500,
      role: "testuser1",
    };

    const { getByText } = render(<ReissueNewDonorCaseSummary {...props} />);

    expect(getByText(/Error reissuing donor case for testuser1/i)).toBeInTheDocument();
    expect(
      getByText(
        /When reporting this issue to the Service Desk, please provide the questionnaire name, user, time and date of the failure./i,
      ),
    ).toBeInTheDocument();
  });

  it("displays the donor-case guidance when the user has no existing donor cases", () => {
    const props = {
      responseMessage: "User has no existing donor cases.",
      statusCode: 500,
      role: "testuser1",
    };

    const { getByText } = render(<ReissueNewDonorCaseSummary {...props} />);

    expect(getByText(/User has not been issued with an initial donor case/i)).toBeInTheDocument();
  });
});
