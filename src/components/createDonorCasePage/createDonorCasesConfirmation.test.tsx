/**
 * @jest-environment jsdom
 */

import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, RouterProvider, Routes, createMemoryRouter, useNavigate } from "react-router-dom";
import CreateDonorCasesConfirmation from "./createDonorCasesConfirmation";
import { ipsQuestionnaire } from "../../features/step_definitions/helpers/apiMockObjects";
import flushPromises from "../../tests/utils";
import "@testing-library/jest-dom";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { Questionnaire } from "blaise-api-node-client";
import QuestionnaireDetails from "../questionnaireDetailsPage/sections/questionnaireDetails";
import QuestionnaireDetailsPage from "../questionnaireDetailsPage/questionnaireDetailsPage";
jest.mock('axios');

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(), // Directly return a jest mock function
}));

const mock = new MockAdapter(axios);

describe("CreateDonorCasesConfirmation rendering and elements are rendered correctly", () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <CreateDonorCasesConfirmation />
            </MemoryRouter>
        );
    });

    it("renders without error", () => {
        expect(screen.getByText("Create donor cases for ?")).toBeInTheDocument();
    });

    it("displays the correct breadcrumb", () => {
        expect(screen.getByText("Home")).toBeInTheDocument();
    });

    it("displays a button to navigate back to create donor case page", () => {
        expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    });

});

describe("CreateDonorCasesConfirmation rendering and paths taken on button clicks", () => {
    const actualUseNavigate = jest.requireActual('react-router-dom').useNavigate;

    afterEach(() => {
        jest.restoreAllMocks(); // Restore original implementations after each test
    });

    it("should correctly navigate back a page if the user clicks Cancel", async () => {

        jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(actualUseNavigate);

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
        mock.onPost("/api/cloudFunction/createDonorCases").reply(200, "Success");
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

        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /Continue/i }));
            await flushPromises();
        });

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                '/api/cloudFunction/createDonorCases',
                { questionnaire_name: ipsQuestionnaire, role: 'IPS Manager' },
                { headers: { "Content-Type": "application/json" } }
            );
        });
    });

    it("should go back to the questionnaire details page if user clicks Continue and the function returns a 200", async () => {
            mock.onPost("/api/cloudFunction/createDonorCases").reply(200, "Success");
            const routes = [
                {
                    path: "/createDonorCasesConfirmation",
                    element: <CreateDonorCasesConfirmation />
                },
                {
                    path: "/questionnaire/:questionnaireName",
                    element: <QuestionnaireDetailsPage />
    
                }
            ];
            const router = createMemoryRouter(routes, {
                initialEntries: [
                    {
                        pathname: "/createDonorCasesConfirmation",
                        state: { questionnaire: ipsQuestionnaire, role: 'IPS Manager' }
                    },
                    {
                        pathname: "/questionnaire/:questionnaireName",
                        state: { questionnaire: ipsQuestionnaire, role: 'IPS Manager' }
                    }
                ],
                initialIndex: 0,
            });
            render(<RouterProvider router={router} />);
            const cancelButton = screen.getByRole("button", { name: "Continue" });
            fireEvent.click(cancelButton);

            expect(screen.getByText("Questionnaire Details")).toBeInTheDocument();
            
        });
});