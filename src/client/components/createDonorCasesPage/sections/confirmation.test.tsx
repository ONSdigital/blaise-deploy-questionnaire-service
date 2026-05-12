import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";

import {
  cloudFunctionAxiosError,
  ipsQuestionnaire,
  mockSuccessResponseForDonorCasesCreation,
} from "../../../features/step_definitions/helpers/api.mock";
import { createWrapper } from "../../../test-utils/renderWithQueryClient";

import { Confirmation } from "./confirmation";

import "@testing-library/jest-dom";

vi.mock("axios");

vi.mock("react-router-dom", async () => ({
  ...(await vi.importActual("react-router-dom")),
  useNavigate: vi.fn(),
}));

const mockedAxios = vi.mocked(axios);

describe("Confirmation rendering", () => {
  const mockOnSuccess = vi.fn<(message: string, statusCode: number) => void>();

  beforeEach(() => {
    render(
      <Confirmation
        questionnaireName={ipsQuestionnaire.name}
        role="IPS Manager"
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() },
    );
  });

  it("displays correct prompt to create donor cases", () => {
    // Text is split across <em> tags, so we need a function matcher
    expect(
      screen.getByText(
        (content, element) => {
          if (!element) return false;
          const text = element.textContent ?? "";

          return (
            text.includes("Create") &&
            text.includes("IPS Manager") &&
            text.includes("donor cases for") &&
            text.includes(ipsQuestionnaire.name)
          );
        },
        { selector: "h1" },
      ),
    ).toBeInTheDocument();
  });

  it("displays a button continue to create donor cases", () => {
    expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument();
  });
});

describe("Confirmation behavior", () => {
  let mockOnSuccess = vi.fn<(message: string, statusCode: number) => void>();

  beforeEach(() => {
    mockOnSuccess = vi.fn<(message: string, statusCode: number) => void>();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("calls onSuccess with response data when the continue button is clicked successfully", async () => {
    mockedAxios.post.mockResolvedValueOnce(mockSuccessResponseForDonorCasesCreation);

    render(
      <Confirmation
        questionnaireName={ipsQuestionnaire.name}
        role="IPS Manager"
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() },
    );

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /Continue/i }));
    });

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "/api/cloudFunction/createDonorCases",
        { questionnaire_name: ipsQuestionnaire.name, role: "IPS Manager" },
        { headers: { "Content-Type": "application/json" } },
      );

      expect(mockOnSuccess).toHaveBeenCalledWith(
        mockSuccessResponseForDonorCasesCreation.data,
        mockSuccessResponseForDonorCasesCreation.status,
      );
    });
  });

  it("calls onSuccess with error status when the API call fails", async () => {
    mockedAxios.post.mockRejectedValue(cloudFunctionAxiosError);

    render(
      <Confirmation
        questionnaireName={ipsQuestionnaire.name}
        role="IPS Manager"
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() },
    );

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /Continue/i }));
    });

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "/api/cloudFunction/createDonorCases",
        { questionnaire_name: ipsQuestionnaire.name, role: "IPS Manager" },
        { headers: { "Content-Type": "application/json" } },
      );

      const callArgs = mockOnSuccess.mock.calls[0];

      expect(callArgs[1]).toBe(500);
    });
  });
});
