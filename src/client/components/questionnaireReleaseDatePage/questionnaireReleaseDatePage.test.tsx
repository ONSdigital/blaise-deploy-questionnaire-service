import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { setTmReleaseDate } from "../../api/tmReleaseDate";

import QuestionnaireReleaseDatePage from "./questionnaireReleaseDatePage";

function renderWithQueryClient(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

vi.mock("../../api/tmReleaseDate", () => ({
  setTmReleaseDate: vi.fn(),
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

describe("QuestionnaireReleaseDatePage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("logs and stays on page when setTmReleaseDate fails", async () => {
    vi.mocked(setTmReleaseDate).mockResolvedValue(false);

    renderWithQueryClient(
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
            element={<QuestionnaireReleaseDatePage />}
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
