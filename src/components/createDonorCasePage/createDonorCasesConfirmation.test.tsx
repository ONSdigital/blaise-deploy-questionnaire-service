/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CreateDonorCasesConfirmation from "./createDonorCasesConfirmation";
import "@testing-library/jest-dom";



describe("CreateDonorCasesConfirmation", () => {
    beforeEach(() => {
        render(
            <MemoryRouter>
                <CreateDonorCasesConfirmation/>
            </MemoryRouter>
        );
    });

    it("renders without error", () => {
        expect(screen.getByText("Create donor cases")).toBeInTheDocument();
    });

    it("displays the correct breadcrumb", () => {
        expect(screen.getByText("Home")).toBeInTheDocument();
    });

    it("displays a button to navigate back to create donor case page", () => {
        expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    });

    it("calls the navigate function when back button is clicked", () => {
        const mockNavigate = jest.fn();
        jest.mock("react-router-dom", () => ({
            ...jest.requireActual("react-router-dom"),
            useNavigate: () => mockNavigate,
        }));

        const cancelButton = screen.getByRole("button", { name: "Cancel" });
        cancelButton.click();

        expect(mockNavigate).toHaveBeenCalled();
    });
});
