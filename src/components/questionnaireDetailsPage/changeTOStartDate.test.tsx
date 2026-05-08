/**
 * @vitest-environment jsdom
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { setToStartDate } from "../../client/toStartDate";

import ChangeToStartDate from "./changeToStartDate";

vi.mock("../../client/toStartDate", () => ({
  setToStartDate: vi.fn(),
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

describe("ChangeToStartDate", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("logs and stays on page when setToStartDate fails", async () => {
    vi.mocked(setToStartDate).mockResolvedValue(false);

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/change",
            state: { toStartDate: "2026-01-01", questionnaireName: "OPN2004A" },
          },
        ]}
      >
        <Routes>
          <Route
            path="/change"
            element={<ChangeToStartDate />}
          />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(mockInfo).toHaveBeenCalledWith(
        "Failed to store telephone operations start date specified",
      );
    });
    expect(mockNavigate).not.toHaveBeenCalledWith(-1);
  });

  it("navigates back on cancel", async () => {
    vi.mocked(setToStartDate).mockResolvedValue(true);

    render(
      <MemoryRouter
        initialEntries={[
          { pathname: "/change", state: { toStartDate: null, questionnaireName: "OPN2004A" } },
        ]}
      >
        <Routes>
          <Route
            path="/change"
            element={<ChangeToStartDate />}
          />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
