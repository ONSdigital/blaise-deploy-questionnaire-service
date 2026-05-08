/**
 * @vitest-environment jsdom
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { setTmReleaseDate } from "../../client/tmReleaseDate";

import ChangeTmReleaseDate from "./changeTmReleaseDate";

vi.mock("../../client/tmReleaseDate", () => ({
  setTmReleaseDate: vi.fn(),
}));

const mockInfo = vi.fn();

vi.mock("../../client/logger", () => ({
  clientLogger: {
    info: (...args: unknown[]) => mockInfo(...args),
    error: vi.fn(),
  },
}));

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("ChangeTmReleaseDate", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("logs and stays on page when setTmReleaseDate fails", async () => {
    vi.mocked(setTmReleaseDate).mockResolvedValue(false);

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/change",
            state: { tmReleaseDate: "2026-01-01", questionnaireName: "OPN2004A" },
          },
        ]}
      >
        <Routes>
          <Route
            path="/change"
            element={<ChangeTmReleaseDate />}
          />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(mockInfo).toHaveBeenCalledWith("Failed to store Totalmobile release date specified");
    });
    expect(mockNavigate).not.toHaveBeenCalledWith(-1);
  });
});
