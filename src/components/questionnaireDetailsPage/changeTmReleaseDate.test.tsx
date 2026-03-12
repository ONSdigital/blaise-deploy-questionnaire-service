/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ChangeTMReleaseDate from "./changeTmReleaseDate";
import { setTMReleaseDate } from "../../client/tmReleaseDate";

jest.mock("../../client/tmReleaseDate", () => ({
    setTMReleaseDate: jest.fn(),
}));

const mockInfo = jest.fn();
jest.mock("../../client/logger", () => ({
    clientLogger: {
        info: (...args: any[]) => mockInfo(...args),
        error: jest.fn(),
    },
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
    const actual = jest.requireActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe("ChangeTMReleaseDate", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("logs and stays on page when setTMReleaseDate fails", async () => {
        (setTMReleaseDate as jest.Mock).mockResolvedValue(false);

        render(
            <MemoryRouter initialEntries={[{ pathname: "/change", state: { tmReleaseDate: "2026-01-01", questionnaireName: "OPN2004A" } }]}>
                <Routes>
                    <Route path="/change" element={<ChangeTMReleaseDate />} />
                </Routes>
            </MemoryRouter>
        );

        fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

        await waitFor(() => {
            expect(mockInfo).toHaveBeenCalledWith("Failed to store Totalmobile release date specified");
        });
        expect(mockNavigate).not.toHaveBeenCalledWith(-1);
    });
});
