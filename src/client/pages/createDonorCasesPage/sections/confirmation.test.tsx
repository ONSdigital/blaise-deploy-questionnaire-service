import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";

import {
  cloudFunctionAxiosError,
  ipsQuestionnaire,
  mockSuccessResponseForDonorCasesCreation,
} from "../../../features/step_definitions/helpers/api.mock";
import { createWrapper } from "../../../test-utils/renderWithQueryClient";

import { Confirmation } from "./confirmation";

import "@testing-library/jest-dom/vitest";

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
        role="IPS Manager"
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() },
    );
  });

  it("displays correct prompt to create donor cases", () => {
    // Text is split across inline tags, so we need a function matcher
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

    expect(screen.getByText("IPS Manager", { selector: "strong" })).toBeInTheDocument();
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

  it("uses the cloud function message when the success payload is an object", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { message: "Created donor cases", status: 200 },
      status: 200,
    } as never);

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
      expect(mockOnSuccess).toHaveBeenCalledWith("Created donor cases", 200);
    });
  });

  it("falls back to a generic success message for unexpected success payloads", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { status: "ok" },
      status: 200,
    } as never);

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
      expect(mockOnSuccess).toHaveBeenCalledWith("Success", 200);
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

      expect(mockOnSuccess).toHaveBeenCalledWith(
        "Error creating IPS donor cases: No users found with role 'IPS Manager'",
        500,
      );
    });
  });

  it("uses an unknown error fallback when the API error has no message", async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error("socket closed"));

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
        role="IPS Manager"
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

  it("passes through a plain string API error body when provided", async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        data: "Plain string error",
      },
    });

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
      expect(mockOnSuccess).toHaveBeenCalledWith("Plain string error", 500);
    });
  });

  it("shows the loading panel while the request is pending", async () => {
    let resolveRequest:
      | ((value: typeof mockSuccessResponseForDonorCasesCreation) => void)
      | undefined;

    mockedAxios.post.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve as (
            value: typeof mockSuccessResponseForDonorCasesCreation,
          ) => void;
        }) as never,
    );

    render(
      <Confirmation
        questionnaireName={ipsQuestionnaire.name}
        role="IPS Manager"
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() },
    );

    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    });

    resolveRequest?.(mockSuccessResponseForDonorCasesCreation);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(
        mockSuccessResponseForDonorCasesCreation.data,
        mockSuccessResponseForDonorCasesCreation.status,
      );
    });
  });

  it("navigates back to the questionnaire when cancel is clicked", () => {
    render(
      <Confirmation
        questionnaireName={ipsQuestionnaire.name}
        role="IPS Manager"
        onSuccess={mockOnSuccess}
      />,
      { wrapper: createWrapper() },
    );

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));

    expect(mockNavigate).toHaveBeenCalledWith(`/questionnaire/${ipsQuestionnaire.name}`);
  });
});
