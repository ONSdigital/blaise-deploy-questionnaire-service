/**
 * @jest-environment jsdom
 */

import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, RouterProvider, Routes, createMemoryRouter, useNavigate } from "react-router-dom";
import CreateDonorCasesConfirmation from "./createDonorCasesConfirmation";
import flushPromises from "../../tests/utils";
import "@testing-library/jest-dom";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { Questionnaire } from "blaise-api-node-client";
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

    it("should redirect back to the questionnaire details page if user clicks Cancel", async () => {

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

    it("should go back to the questionnaire details page if user clicks Continue and success pannel is shown", async () => {

        // axios.post.mockResolvedValue({ data: {} });
        mock.onPost("/api/cloudFunction/createDonorCases").reply(200, "Success");
        const routes = [
            {
                path: "/createDonorCasesConfirmation",
                element: <CreateDonorCasesConfirmation />
            }
        ];

        const router = createMemoryRouter(routes, {
            initialEntries: ["/createDonorCasesConfirmation"],
            initialIndex: 0,
        });

        render(<RouterProvider router={router} />);

        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /Continue/i }));
            await flushPromises();
        });

        await waitFor(() => {
            // Check page has been redirected to summary page
            expect(axios.post).toHaveBeenCalledWith('/some-endpoint');
            // expect(router.state.location.pathname).toContain("/questionnaire");
            // expect(screen.findByText("Donor cases created successfully for")).toBeDefined();
        });
    });

    it.skip("should go back to the questionnaire details page if user clicks Continue and error pannel is shown", async () => {

        mock.onPost("/api/cloudFunction/createDonorCases").reply(500, "Failed to create donor cases");
        const routes = [
            {
                path: "/createDonorCasesConfirmation",
                element: <CreateDonorCasesConfirmation />
            }
        ];

        const router = createMemoryRouter(routes, {
            initialEntries: ["/createDonorCasesConfirmation"],
            initialIndex: 0,
        });

        render(<RouterProvider router={router} />);

        await act(async () => {
            await flushPromises();
        });

        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: /Continue/i }));
            await flushPromises();
        });

        await waitFor(() => {
            // Check page has been redirected to summary page
            expect(router.state.location.pathname).toContain("/questionnaire");
            expect(screen.findByText("Error creating donor cases for")).toBeDefined();
        });
    });
});