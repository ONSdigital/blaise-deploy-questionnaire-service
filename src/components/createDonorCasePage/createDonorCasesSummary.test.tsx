/**
 * @jest-environment jsdom
 */

import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom"; // Make sure to import jest-dom matchers
import CreateDonorCasesSummary from "./createDonorCasesSummary";

describe("CreateDonorCasesSummary", () => {
    it("displays success message when receiving a successful response with status code 200 or 201", () => {
        const props = {
            donorCasesResponseMessage: "Success",
            donorCasesStatusCode: 200,
            role: "IPS Manager",
        };

        const { getByText } = render(<CreateDonorCasesSummary {...props} />);
        expect(
            getByText(/Donor cases created successfully for IPS Manager/i)
        ).toBeInTheDocument();
        expect(getByText(/Success/i)).toBeInTheDocument();
    });

    it("displays received error message from cloud function API when receiving a failed response", () => {
        const props = {
            donorCasesResponseMessage: "Internal Server Error",
            donorCasesStatusCode: 500,
            role: "IPS Manager",
        };

        const { getByText } = render(<CreateDonorCasesSummary {...props} />);
        expect(
            getByText(/Error creating donor cases for IPS Manager/i)
        ).toBeInTheDocument();
        expect(getByText(/Internal Server Error/i)).toBeInTheDocument();
    });
});
