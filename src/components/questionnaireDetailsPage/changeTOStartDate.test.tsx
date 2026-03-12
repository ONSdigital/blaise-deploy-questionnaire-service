/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ChangeTOStartDate from "./changeTOStartDate";
import { setTOStartDate } from "../../client/toStartDate";

jest.mock("../../client/toStartDate", () => ({
    setTOStartDate: jest.fn(),
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

describe("ChangeTOStartDate", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("logs and stays on page when setTOStartDate fails", async () => {
        (setTOStartDate as jest.Mock).mockResolvedValue(false);

        render(
            <MemoryRouter initialEntries={[{ pathname: "/change", state: { toStartDate: "2026-01-01", questionnaireName: "OPN2004A" } }]}>
                <Routes>
                    <Route path="/change" element={<ChangeTOStartDate />} />
                </Routes>
            </MemoryRouter>
        );

        fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

        await waitFor(() => {
            expect(mockInfo).toHaveBeenCalledWith("Failed to store telephone operations start date specified");
        });
        expect(mockNavigate).not.toHaveBeenCalledWith(-1);
    });

    it("navigates back on cancel", async () => {
        (setTOStartDate as jest.Mock).mockResolvedValue(true);

        render(
            <MemoryRouter initialEntries={[{ pathname: "/change", state: { toStartDate: null, questionnaireName: "OPN2004A" } }]}>
                <Routes>
                    <Route path="/change" element={<ChangeTOStartDate />} />
                </Routes>
            </MemoryRouter>
        );

        fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));
        expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
});
