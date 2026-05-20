import axios from "axios";
import { GoogleAuth } from "google-auth-library";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { callCloudFunction } from "./cloudFunctionCallerHelper.js";

vi.mock("google-auth-library");
vi.mock("axios");
vi.mock("../config", () => ({
  getConfigFromEnv: () => ({
    createDonorCasesCloudFunctionUrl: "https://example.com/create-donor-cases",
    reissueNewDonorCaseCloudFunctionUrl: "https://example.com/reissue-new-donor-case",
  }),
}));

const mockConfig = {
  createDonorCasesCloudFunctionUrl: "https://example.com/create-donor-cases",
  reissueNewDonorCaseCloudFunctionUrl: "https://example.com/reissue-new-donor-case",
};
const ipsQuestionnaireName = "IPS1337a";
const mockedAxiosPost = vi.mocked(axios.post);
const mockedGoogleAuth = vi.mocked(GoogleAuth);

describe("Call Cloud Function to create donor cases and return responses", () => {
  let mockGetIdTokenClient: ReturnType<typeof vi.fn>;
  let mockFetchIdToken: ReturnType<typeof vi.fn>;
  const dummyToken = process.env.AUTH_TOKEN;

  beforeEach(() => {
    mockFetchIdToken = vi.fn().mockResolvedValue(dummyToken);
    mockGetIdTokenClient = vi.fn().mockResolvedValue({
      idTokenProvider: {
        fetchIdToken: mockFetchIdToken,
      },
    });
    mockedGoogleAuth.mockImplementation(function MockGoogleAuth() {
      return {
        getIdTokenClient: mockGetIdTokenClient,
      } as unknown as GoogleAuth;
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should return message and status when donor cases are created successfully", async () => {
    const dummyUrl = mockConfig.createDonorCasesCloudFunctionUrl;

    const payload = {
      questionnaire_name: ipsQuestionnaireName,
      role: "IPS Manager",
    };

    const mockSuccessResponse = {
      message: "Success",
      status: 200,
    };

    mockedAxiosPost.mockResolvedValue({
      data: mockSuccessResponse.message,
      status: mockSuccessResponse.status,
    });

    const result = await callCloudFunction(dummyUrl, payload);

    expect(mockGetIdTokenClient).toHaveBeenCalledWith(dummyUrl);
    expect(mockFetchIdToken).toHaveBeenCalledWith(dummyUrl);

    expect(result).toEqual({
      message: "Success",
      status: 200,
    });

    expect(axios.post).toHaveBeenCalledWith(dummyUrl, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${dummyToken}`,
      },
    });
  });

  it("should return response data and status from cloud function when it returns a non-200 response", async () => {
    const dummyUrl = mockConfig.createDonorCasesCloudFunctionUrl;

    const payload = {
      questionnaire_name: ipsQuestionnaireName,
      role: "IPS Manager",
    };
    const mockResponse = {
      message: "Error invoking cloud function",
      status: 500,
    };

    mockedAxiosPost.mockResolvedValue({
      data: mockResponse.message,
      status: mockResponse.status,
    });

    const result = await callCloudFunction(dummyUrl, payload);

    expect(mockGetIdTokenClient).toHaveBeenCalledWith(dummyUrl);
    expect(mockFetchIdToken).toHaveBeenCalledWith(dummyUrl);

    expect(result).toEqual({
      message: "Error invoking cloud function",
      status: 500,
    });

    expect(axios.post).toHaveBeenCalledWith(dummyUrl, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${dummyToken}`,
      },
    });
  });
});
