import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { getTmReleaseDate, setTmReleaseDate } from "../../api/tmReleaseDate";

import QuestionnaireTmReleaseDatePage from "./questionnaireTmReleaseDatePage";

function renderWithQueryClient(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

vi.mock("../../api/tmReleaseDate", () => ({
  getTmReleaseDate: vi.fn(),
  setTmReleaseDate: vi.fn(),
}));

const mockInfo = vi.fn();
const mockError = vi.fn();

vi.mock("../../utils/logger", () => ({
  clientLogger: {
    info: (...args: unknown[]) => mockInfo(...args),
    error: (...args: unknown[]) => mockError(...args),
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

describe("QuestionnaireTmReleaseDatePage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("navigates back on cancel when no route params or location state are available", () => {
    renderWithQueryClient(
      <MemoryRouter initialEntries={["/change"]}>
        <Routes>
          <Route
            path="/change"
            element={<QuestionnaireTmReleaseDatePage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));

    expect(mockNavigate).toHaveBeenCalledWith(-1);
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
            element={<QuestionnaireTmReleaseDatePage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith("Failed to store Totalmobile release date");
    });
    expect(mockNavigate).not.toHaveBeenCalledWith(-1);
  });

  it("clears the release date and navigates back when the user chooses no", async () => {
    vi.mocked(setTmReleaseDate).mockResolvedValue(true);

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
            element={<QuestionnaireTmReleaseDatePage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByLabelText(/No release date/i));
    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(setTmReleaseDate).toHaveBeenCalledWith("OPN2004A", "");
      expect(mockNavigate).toHaveBeenCalledWith("/questionnaire/OPN2004A", { replace: true });
    });
  });

  it("supports direct questionnaire routes by fetching the current release date and returning to details", async () => {
    vi.mocked(getTmReleaseDate).mockResolvedValueOnce("2026-01-01");

    renderWithQueryClient(
      <MemoryRouter initialEntries={["/questionnaire/LMS2605_LJ2/release-date"]}>
        <Routes>
          <Route
            path="/questionnaire/:questionnaireName/release-date"
            element={<QuestionnaireTmReleaseDatePage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(getTmReleaseDate).toHaveBeenCalledWith("LMS2605_LJ2");
    });
    await waitFor(() => screen.getByRole("button", { name: /Cancel/i }));

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/questionnaire/LMS2605_LJ2", { replace: true });
  });
});
