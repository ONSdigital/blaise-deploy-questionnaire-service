import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { setToStartDate } from "../../api/toStartDate";

import QuestionnaireStartDatePage from "./questionnaireStartDatePage";

function renderWithQueryClient(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

vi.mock("../../api/toStartDate", () => ({
  setToStartDate: vi.fn(),
}));

const mockInfo = vi.fn();

vi.mock("../../utils/logger", () => ({
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

describe("QuestionnaireStartDatePage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("logs and stays on page when setToStartDate fails", async () => {
    vi.mocked(setToStartDate).mockResolvedValue(false);

    renderWithQueryClient(
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
            element={<QuestionnaireStartDatePage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(mockInfo).toHaveBeenCalledWith(
        "Failed to store Telephone Operations start date specified",
      );
    });
    expect(mockNavigate).not.toHaveBeenCalledWith(-1);
  });

  it("navigates back on cancel", async () => {
    vi.mocked(setToStartDate).mockResolvedValue(true);

    renderWithQueryClient(
      <MemoryRouter
        initialEntries={[
          { pathname: "/change", state: { toStartDate: null, questionnaireName: "OPN2004A" } },
        ]}
      >
        <Routes>
          <Route
            path="/change"
            element={<QuestionnaireStartDatePage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });
});
