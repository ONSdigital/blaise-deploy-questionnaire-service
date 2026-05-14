import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";

import {
  cloudFunctionAxiosError,
  ipsQuestionnaire,
  mockSuccessResponseForReissueNewDonorCase,
} from "../../../features/step_definitions/helpers/api.mock";
import { createWrapper } from "../../../test-utils/renderWithQueryClient";

import { Confirmation } from "./confirmation";

import "@testing-library/jest-dom";

vi.mock("axios");

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async () => ({
  ...(await vi.importActual("react-router-dom")),
  useNavigate: () => mockNavigate,
}));

const mockedAxios = vi.mocked(axios);

describe("Confirmation rendering", () => {
  const mockOnSuccess = vi.fn<(message: string, statusCode: number) => void>();

  beforeEach(() => {
    render(
      <Confirmation
        questionnaireName={ipsQuestionnaire.name}
        user="test_user"
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() },
    );
  });

  it("displays correct prompt to reissue new donor case", () => {
    expect(
      screen.getByText(
        (_, element) => {
          if (!element) return false;
          const text = element.textContent ?? "";

          return (
            text.includes("Reissue a new donor case for") &&
            text.includes(ipsQuestionnaire.name) &&
            text.includes("on behalf of") &&
            text.includes("test_user")
          );
        },
        { selector: "h1" },
      ),
    ).toBeInTheDocument();
  });

  it("displays a button continue to reissue new donor case", () => {
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
    mockedAxios.post.mockResolvedValueOnce(mockSuccessResponseForReissueNewDonorCase);

    render(
      <Confirmation
        questionnaireName={ipsQuestionnaire.name}
        user="testuser"
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() },
    );

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /Continue/i }));
    });

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "/api/cloudFunction/reissueNewDonorCase",
        { questionnaire_name: ipsQuestionnaire.name, user: "testuser", role: "testuser" },
        { headers: { "Content-Type": "application/json" } },
      );

      expect(mockOnSuccess).toHaveBeenCalledWith(
        mockSuccessResponseForReissueNewDonorCase.data,
        mockSuccessResponseForReissueNewDonorCase.status,
      );
    });
  });

  it("calls onSuccess with error status when the API call fails", async () => {
    mockedAxios.post.mockRejectedValue(cloudFunctionAxiosError);

    render(
      <Confirmation
        questionnaireName={ipsQuestionnaire.name}
        user="testuser"
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() },
    );

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /Continue/i }));
    });

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        "/api/cloudFunction/reissueNewDonorCase",
        { questionnaire_name: ipsQuestionnaire.name, user: "testuser", role: "testuser" },
        { headers: { "Content-Type": "application/json" } },
      );

      const callArgs = mockOnSuccess.mock.calls[0];

      expect(callArgs[1]).toBe(500);
    });
  });

  it("uses an unknown error fallback when the API error has no message", async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error("socket closed"));

    render(
      <Confirmation
        questionnaireName={ipsQuestionnaire.name}
        user="testuser"
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() },
    );

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /Continue/i }));
    });

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith("Unknown error", 500);
    });
  });

  it("passes through the API message when one is provided", async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        data: {
          message: "Cloud function failed",
        },
      },
    });

    render(
      <Confirmation
        questionnaireName={ipsQuestionnaire.name}
        user="testuser"
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() },
    );

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: /Continue/i }));
    });

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith("Cloud function failed", 500);
    });
  });

  it("shows the loading panel while the request is pending", async () => {
    let resolveRequest:
      | ((value: typeof mockSuccessResponseForReissueNewDonorCase) => void)
      | undefined;

    mockedAxios.post.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve as (value: typeof mockSuccessResponseForReissueNewDonorCase) => void;
        }) as never,
    );

    render(
      <Confirmation
        questionnaireName={ipsQuestionnaire.name}
        user="testuser"
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() },
    );

    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    });

    resolveRequest?.(mockSuccessResponseForReissueNewDonorCase);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(
        mockSuccessResponseForReissueNewDonorCase.data,
        mockSuccessResponseForReissueNewDonorCase.status,
      );
    });
  });

  it("navigates back to the questionnaire when cancel is clicked", () => {
    render(
      <Confirmation
        questionnaireName={ipsQuestionnaire.name}
        user="testuser"
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() },
    );

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));

    expect(mockNavigate).toHaveBeenCalledWith(`/questionnaire/${ipsQuestionnaire.name}`);
  });
});
