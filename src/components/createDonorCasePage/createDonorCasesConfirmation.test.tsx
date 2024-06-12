/**
 * @jest-environment jsdom
 */

import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, RouterProvider, Routes, createMemoryRouter, useNavigate, useParams } from "react-router-dom";
import CreateDonorCasesConfirmation from "./createDonorCasesConfirmation";
import flushPromises from "../../tests/utils";
import "@testing-library/jest-dom";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import QuestionnaireDetailsPage from "../questionnaireDetailsPage/questionnaireDetailsPage";
import { ipsQuestionnaire } from "../../features/step_definitions/helpers/apiMockObjects";

jest.mock("axios");

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(), // Directly return a jest mock function
    useParams: jest.fn(),
}));

const mock = new MockAdapter(axios);


const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedUseParams = useParams as jest.Mock;

describe("CreateDonorCasesConfirmation rendering and elements are rendered correctly", () => {
    beforeEach(() => {
        const dom = render(
            <MemoryRouter>
                <CreateDonorCasesConfirmation />
            </MemoryRouter>
        );
    });

    it("renders without error", () => {
        expect(screen.getByText("Create donor cases for ?")).toBeInTheDocument();
    });

    it("displays the correct breadcrumbs", () => {
        expect.assertions(2);

        expect(screen.getByTestId("breadcrumb-0")).toBeInTheDocument();
        expect(screen.getByTestId("breadcrumb-1")).toBeInTheDocument();
    });

    it("displays a button to navigate back to create donor case page", () => {
        expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    });

});

describe("CreateDonorCasesConfirmation rendering and paths taken on button clicks", () => {

    afterEach(() => {
        jest.restoreAllMocks(); // Restore original implementations after each test
    });

    it("should redirect back to the questionnaire details page if user clicks Cancel", async () => {

        const navigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);

        render(<MemoryRouter>
            <CreateDonorCasesConfirmation />
        </MemoryRouter>);

        const cancelButton = screen.getByRole("button", { name: "Cancel" });
        fireEvent.click(cancelButton);

        expect(navigate).toHaveBeenCalledWith(-1);
    });

    it("calls the API endpoint correctly when the continue button is clicked", async () => {

        const navigate = jest.fn();

        (useNavigate as jest.Mock).mockImplementation(() => navigate);

        const routes = [
            {
                path: "/createDonorCasesConfirmation",
                element: <CreateDonorCasesConfirmation />
            }
        ];

        const router = createMemoryRouter(routes, {
            initialEntries: [
                {
                    pathname: "/createDonorCasesConfirmation",
                    state: { questionnaire: ipsQuestionnaire, role: 'IPS Manager' }
                }
            ],
            initialIndex: 0,
        });

        render(<RouterProvider router={router} />);

        const mockResponseFromCallCloudFunctionAPI = {
            data: "Success",
            status: 200,
        };
        mockedAxios.post.mockResolvedValueOnce(mockResponseFromCallCloudFunctionAPI);

        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /Continue/i }));
            await flushPromises();
        });
        await waitFor(() => {

            expect(mockedAxios.post).toHaveBeenCalledWith(
                "/api/cloudFunction/createDonorCases",
                { questionnaire_name: ipsQuestionnaire, role: "IPS Manager" },
                { headers: { "Content-Type": "application/json" } }
            );
            // Check page has been redirected to Details page
            expect(navigate).toHaveBeenCalledWith("/questionnaire/IPS1337a",
                {
                    state: {
                        donorCasesResponseMessage: mockResponseFromCallCloudFunctionAPI.data,
                        donorCasesStatusCode: mockResponseFromCallCloudFunctionAPI.status,
                        questionnaire: ipsQuestionnaire,
                        role: "IPS Manager"
                    }
                });

        });

    });

    it("should go back to the questionnaire details page if user clicks Continue and error pannel is shown", async () => {

        const navigate = jest.fn();

        (useNavigate as jest.Mock).mockImplementation(() => navigate);

        const routes = [
            {
                path: "/createDonorCasesConfirmation",
                element: <CreateDonorCasesConfirmation />
            }
        ];
        const router = createMemoryRouter(routes, {
            initialEntries: [
                {
                    pathname: "/createDonorCasesConfirmation",
                    state: { questionnaire: ipsQuestionnaire, role: 'IPS Manager' }
                }
            ],
            initialIndex: 0,
        });

        render(<RouterProvider router={router} />);

        const mockResponseFromCallCloudFunctionAPI = {
            data: "Error invoking the cloud function",
            status: 500,
        };

        mockedAxios.post.mockRejectedValueOnce(mockResponseFromCallCloudFunctionAPI);

        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /Continue/i }));
            await flushPromises();
        });
        await waitFor(() => {

            expect(mockedAxios.post).toHaveBeenCalledWith(
                "/api/cloudFunction/createDonorCases",
                { questionnaire_name: ipsQuestionnaire, role: "IPS Manager" },
                { headers: { "Content-Type": "application/json" } }
            );
            // Check page has been redirected to Details page
            expect(navigate).toHaveBeenCalledWith("/questionnaire/IPS1337a",
                {
                    state: {
                        donorCasesResponseMessage: mockResponseFromCallCloudFunctionAPI.data,
                        donorCasesStatusCode: mockResponseFromCallCloudFunctionAPI.status,
                        questionnaire: ipsQuestionnaire,
                        role: "IPS Manager"
                    }
                });

        });


    });
});