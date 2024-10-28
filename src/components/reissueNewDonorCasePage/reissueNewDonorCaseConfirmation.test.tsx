/**
 * @jest-environment jsdom
 */

import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, RouterProvider, createMemoryRouter, useNavigate, useParams } from "react-router-dom";
import ReissueNewDonorCaseConfirmation from "./reissueNewDonorCaseConfirmation";
import "@testing-library/jest-dom";
import axios from "axios";
import {
    cloudFunctionAxiosError,
    ipsQuestionnaire,
    mockSectionForReissueNewDonorCase,
    mockSuccessResponseForReissueNewDonorCase
} from "../../features/step_definitions/helpers/apiMockObjects";

jest.mock("axios");

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn()
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("ReissueNewDonorCaseConfirmation rendering", () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <ReissueNewDonorCaseConfirmation />
            </MemoryRouter>
        );
    });

    it("displays correct prompt to reissue new donor case", () => {
        expect(screen.getByText("Reissue a new donor case for on behalf of ?")).toBeInTheDocument();
    });

    it("displays the correct number of breadcrumbs", () => {
        expect.assertions(2);

        expect(screen.getByTestId("breadcrumb-0")).toBeInTheDocument();
        expect(screen.getByTestId("breadcrumb-1")).toBeInTheDocument();
    });

    it("displays a button continue to reissue new donor case", () => {
        expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument();
    });

    it("displays a button to navigate back to reissue new donor case page", () => {
        expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    });

});

describe("ReissueNewDonorCaseConfirmation navigation", () => {
    let navigate: jest.Mock;
    const routes = [
        {
            path: "/reissueNewDonorCaseConfirmation",
            element: <ReissueNewDonorCaseConfirmation />,
        },
    ];

    const initialEntries = [
        {
            pathname: "/reissueNewDonorCaseConfirmation",
            state: { questionnaire: ipsQuestionnaire, user: "testuser" },
        },
    ];
    beforeEach(() => {
        navigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);

        const router = createMemoryRouter(routes, {
            initialEntries,
            initialIndex: 0,
        });

        render(<RouterProvider router={router} />);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should redirect back to the questionnaire details page if user clicks Cancel", async () => {

        act(() => {
            fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
        });

        expect(navigate).toHaveBeenCalledWith("/questionnaire/IPS1337a", {
            state: {
                section: "reissueNewDonorCase",
                responseMessage: "",
                statusCode: 0,
                role: "",
                questionnaire: ipsQuestionnaire,
            },
        });
    });

    it("calls the API endpoint correctly when the continue button is clicked", async () => {

        mockedAxios.post.mockResolvedValueOnce(mockSuccessResponseForReissueNewDonorCase);
        act(() => {
            fireEvent.click(screen.getByRole("button", { name: /Continue/i }));
        });
        await waitFor(() => {

            expect(mockedAxios.post).toHaveBeenCalledWith(
                "/api/cloudFunction/reissueNewDonorCase",
                { questionnaire_name: ipsQuestionnaire.name, role: "testuser" },
                { headers: { "Content-Type": "application/json" } }
            );

            expect(navigate).toHaveBeenCalledWith("/questionnaire/IPS1337a",
                {
                    state: {
                        section: mockSectionForReissueNewDonorCase.data,
                        responseMessage: mockSuccessResponseForReissueNewDonorCase.data,
                        statusCode: mockSuccessResponseForReissueNewDonorCase.status,
                        questionnaire: ipsQuestionnaire,
                        role: "testuser"
                    }
                });

        });

    });

    it("should go back to the questionnaire details page if user clicks Continue and error panel is shown", async () => {

        mockedAxios.post.mockRejectedValue(cloudFunctionAxiosError);
        act(() => {
            fireEvent.click(screen.getByRole("button", { name: /Continue/i }));
        });
        await waitFor(() => {

            expect(mockedAxios.post).toHaveBeenCalledWith(
                "/api/cloudFunction/reissueNewDonorCase",
                { questionnaire_name: ipsQuestionnaire.name, role: "testuser" },
                { headers: { "Content-Type": "application/json" } }
            );

            expect(navigate).toHaveBeenCalledWith("/questionnaire/IPS1337a",
                {
                    state: {
                        section: "reissueNewDonorCase",
                        responseMessage: (cloudFunctionAxiosError as any).response.data.message,
                        statusCode: 500,
                        questionnaire: ipsQuestionnaire,
                        role: "testuser"
                    }
                });
        });

    });
});
