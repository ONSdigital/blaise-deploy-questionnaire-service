import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { getToStartDate, setToStartDate } from "../../api/toStartDate";

import QuestionnaireToStartDatePage from "./questionnaireToStartDatePage";

function renderWithQueryClient(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

vi.mock("../../api/toStartDate", () => ({
  getToStartDate: vi.fn(),
  setToStartDate: vi.fn(),
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

describe("QuestionnaireToStartDatePage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("navigates back on cancel when no route params or location state are available", () => {
    renderWithQueryClient(
      <MemoryRouter initialEntries={["/change"]}>
        <Routes>
          <Route
            path="/change"
            element={<QuestionnaireToStartDatePage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));

    expect(mockNavigate).toHaveBeenCalledWith(-1);
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
            element={<QuestionnaireToStartDatePage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith("Failed to store Telephone Operations start date");
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
            element={<QuestionnaireToStartDatePage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/questionnaire/OPN2004A", { replace: true });
  });

  it("clears the start date and navigates back when the user chooses no", async () => {
    vi.mocked(setToStartDate).mockResolvedValue(true);

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
            element={<QuestionnaireToStartDatePage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByLabelText(/No start date/i));
    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(setToStartDate).toHaveBeenCalledWith("OPN2004A", "");
      expect(mockNavigate).toHaveBeenCalledWith("/questionnaire/OPN2004A", { replace: true });
    });
  });

  it("supports direct questionnaire routes by fetching the current start date and returning to details", async () => {
    vi.mocked(getToStartDate).mockResolvedValueOnce("2026-01-01");

    renderWithQueryClient(
      <MemoryRouter initialEntries={["/questionnaire/LMS2605_LJ2/start-date"]}>
        <Routes>
          <Route
            path="/questionnaire/:questionnaireName/start-date"
            element={<QuestionnaireToStartDatePage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(getToStartDate).toHaveBeenCalledWith("LMS2605_LJ2");
    });
    await waitFor(() => screen.getByRole("button", { name: /Cancel/i }));

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/questionnaire/LMS2605_LJ2", { replace: true });
  });
});
