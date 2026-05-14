import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import CreateDonorCasesPage from "./createDonorCasesPage";

vi.mock("axios");

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockedAxios = vi.mocked(axios);

function renderWithQueryClient(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("CreateDonorCasesPage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("supports direct URLs with an encoded role parameter", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: "Created", status: 201 } as never);

    renderWithQueryClient(
      <MemoryRouter initialEntries={["/questionnaire/IPS0001A/create-donor-cases/IPS%20Manager"]}>
        <Routes>
          <Route
            path="/questionnaire/:questionnaireName/create-donor-cases/:role"
            element={<CreateDonorCasesPage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(/Create/i, { selector: "h1" }).textContent).toContain("IPS Manager");

    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "/api/cloudFunction/createDonorCases",
        { questionnaire_name: "IPS0001A", role: "IPS Manager" },
        expect.any(Object),
      );
      expect(mockNavigate).toHaveBeenCalledWith("/questionnaire/IPS0001A", {
        replace: true,
        state: {
          questionnaire: null,
          responseMessage: "Created",
          role: "IPS Manager",
          section: "createDonorCases",
          statusCode: 201,
        },
      });
    });
  });

  it("redirects back to the questionnaire when the role route parameter is missing", async () => {
    renderWithQueryClient(
      <MemoryRouter initialEntries={["/questionnaire/IPS0001A/create-donor-cases"]}>
        <Routes>
          <Route
            path="/questionnaire/:questionnaireName/create-donor-cases/:role?"
            element={<CreateDonorCasesPage />}
          />
          <Route
            path="/questionnaire/:questionnaireName"
            element={<h1>Questionnaire details</h1>}
          />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Questionnaire details/i })).toBeInTheDocument();
    });
  });

  it("redirects to the home page when the questionnaire route parameter is missing", async () => {
    renderWithQueryClient(
      <MemoryRouter initialEntries={["/create-donor-cases"]}>
        <Routes>
          <Route
            path="/:questionnaireName?/create-donor-cases/:role?"
            element={<CreateDonorCasesPage />}
          />
          <Route
            path="/"
            element={<h1>Questionnaire list</h1>}
          />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Questionnaire list/i })).toBeInTheDocument();
    });
  });
});