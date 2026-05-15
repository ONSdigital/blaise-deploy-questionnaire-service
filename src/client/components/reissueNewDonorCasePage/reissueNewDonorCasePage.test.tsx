import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import ReissueNewDonorCasePage from "./reissueNewDonorCasePage";

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

describe("ReissueNewDonorCasePage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("supports direct URLs with an encoded user parameter", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: "Reissued", status: 201 } as never);

    renderWithQueryClient(
      <MemoryRouter initialEntries={["/questionnaire/IPS0001A/reissue-new-donor-case/test%20user"]}>
        <Routes>
          <Route
            path="/questionnaire/:questionnaireName/reissue-new-donor-case/:user"
            element={<ReissueNewDonorCasePage />}
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.getByText(/Reissue a new donor case for/i, { selector: "h1" }).textContent,
    ).toContain("test user");

    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "/api/cloudFunction/reissueNewDonorCase",
        { questionnaire_name: "IPS0001A", role: "test user", user: "test user" },
        expect.any(Object),
      );
      expect(mockNavigate).toHaveBeenCalledWith("/questionnaire/IPS0001A", {
        replace: true,
        state: {
          questionnaire: null,
          responseMessage: "Reissued",
          role: "test user",
          section: "reissueNewDonorCase",
          statusCode: 201,
        },
      });
    });
  });

  it("redirects back to the questionnaire when the user route parameter is missing", async () => {
    renderWithQueryClient(
      <MemoryRouter initialEntries={["/questionnaire/IPS0001A/reissue-new-donor-case"]}>
        <Routes>
          <Route
            path="/questionnaire/:questionnaireName/reissue-new-donor-case/:user?"
            element={<ReissueNewDonorCasePage />}
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
      <MemoryRouter initialEntries={["/reissue-new-donor-case"]}>
        <Routes>
          <Route
            path="/:questionnaireName?/reissue-new-donor-case/:user?"
            element={<ReissueNewDonorCasePage />}
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
