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
            responseMessage: "Success",
            statusCode: 200,
            role: "testuser1",
        };

        const { getByText } = render(<ReissueNewDonorCaseSummary {...props} />);
        expect(
            getByText(/Reissued donor case created successfully for testuser1/i)
        ).toBeInTheDocument();
        expect(getByText(/Success/i)).toBeInTheDocument();
    });

    it("displays an error message when receiving a failed response from the cloud function", () => {
        const props = {
            responseMessage: "Internal Server Error",
            statusCode: 500,
            role: "testuser1",
        };

        const { getByText } = render(<ReissueNewDonorCaseSummary {...props} />);
        expect(
            getByText(/Error reissuing new donor case for testuser1/i)
        ).toBeInTheDocument();
        expect(getByText(/Internal Server Error/i)).toBeInTheDocument();
    });
});
