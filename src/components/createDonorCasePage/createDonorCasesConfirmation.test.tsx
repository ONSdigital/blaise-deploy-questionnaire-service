/**
 * @jest-environment jsdom
 */

import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, RouterProvider, createMemoryRouter, useNavigate, useParams } from "react-router-dom";
import CreateDonorCasesConfirmation from "./createDonorCasesConfirmation";
import flushPromises from "../../tests/utils";
import "@testing-library/jest-dom";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { cloudFunctionAxiosError, ipsQuestionnaire } from "../../features/step_definitions/helpers/apiMockObjects";

jest.mock("axios");

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(),
    useParams: jest.fn(),
}));

const mock = new MockAdapter(axios);

const mockedAxios = axios as jest.Mocked<typeof axios>;

useParams as jest.Mock;

describe("CreateDonorCasesConfirmation rendering", () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <CreateDonorCasesConfirmation />
            </MemoryRouter>
        );
    });

    it("displays correct prompt to create donor cases", () => {
        expect(screen.getByText("Create donor cases for ?")).toBeInTheDocument();
    });

    it("displays the correct number of breadcrumbs", () => {
        expect.assertions(2);

        expect(screen.getByTestId("breadcrumb-0")).toBeInTheDocument();
        expect(screen.getByTestId("breadcrumb-1")).toBeInTheDocument();
    });

    it("displays a button continue to create donor cases", () => {
        expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument();
    });

    it("displays a button to navigate back to create donor case page", () => {
        expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    });

});

describe("CreateDonorCasesConfirmation navigation", () => {

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should redirect back to the questionnaire details page if user clicks Cancel", async () => {

        const navigate = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigate);

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
                    state: { questionnaire: ipsQuestionnaire, role: "IPS Manager" }
                }
            ],
            initialIndex: 0,
        });

        render(<RouterProvider router={router} />);

        const cancelButton = screen.getByRole("button", { name: "Cancel" });
        fireEvent.click(cancelButton);

        expect(navigate).toHaveBeenCalledWith("/questionnaire/IPS1337a",
            {
                state: {
                    donorCasesResponseMessage: "",
                    donorCasesStatusCode: 0,
                    role: "",
                    questionnaire: ipsQuestionnaire
                }
            });
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
                    state: { questionnaire: ipsQuestionnaire, role: "IPS Manager" }
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
                { questionnaire_name: ipsQuestionnaire.name, role: "IPS Manager" },
                { headers: { "Content-Type": "application/json" } }
            );
            
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

    it("should go back to the questionnaire details page if user clicks Continue and error panel is shown", async () => {

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
                    state: { questionnaire: ipsQuestionnaire, role: "IPS Manager" }
                }
            ],
            initialIndex: 0,
        });

        render(<RouterProvider router={router} />);

        mockedAxios.post.mockRejectedValue(cloudFunctionAxiosError);

        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /Continue/i }));
            await flushPromises();
        });
        await waitFor(() => {

            expect(mockedAxios.post).toHaveBeenCalledWith(
                "/api/cloudFunction/createDonorCases",
                { questionnaire_name: ipsQuestionnaire.name, role: "IPS Manager" },
                { headers: { "Content-Type": "application/json" } }
            );
            
            expect(navigate).toHaveBeenCalledWith("/questionnaire/IPS1337a",
                {
                    state: {
                        donorCasesResponseMessage: (cloudFunctionAxiosError as any).response.data.message,
                        donorCasesStatusCode: 500,
                        questionnaire: ipsQuestionnaire,
                        role: "IPS Manager"
                    }
                });

        });

    });
});