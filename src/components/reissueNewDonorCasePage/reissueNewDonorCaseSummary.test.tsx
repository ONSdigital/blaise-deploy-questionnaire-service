/**
 * @jest-environment jsdom
 */

import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import ReissueNewDonorCaseSummary from "./reissueNewDonorCaseSummary";

describe("ReissueNewDonorCaseSummary", () => {
    it("displays a success message when receiving a successful response from the cloud function", () => {
        const props = {
            reissueNewDonorCaseResponseMessage: "Success",
            reissueNewDonorCaseStatusCode: 200,
            user: "testuser1",
        };

        const { getByText } = render(<ReissueNewDonorCaseSummary {...props} />);
        expect(
            getByText(/Donor case successfully reissued for IPS Manager/i)
        ).toBeInTheDocument();
        expect(getByText(/Success/i)).toBeInTheDocument();
    });

    it("displays an error message when receiving a failed response from the cloud function", () => {
        const props = {
            reissueNewDonorCaseResponseMessage: "Internal Server Error",
            reissueNewDonorCaseStatusCode: 500,
            user: "testuser1",
        };

        const { getByText } = render(<ReissueNewDonorCaseSummary {...props} />);
        expect(
            getByText(/Error reissuing donor case for IPS Manager/i)
        ).toBeInTheDocument();
        expect(getByText(/Internal Server Error/i)).toBeInTheDocument();
    });
});
