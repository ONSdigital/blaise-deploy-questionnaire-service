/**
 * @vitest-environment node
 */
import axios from "axios";
import { GoogleAuth } from "google-auth-library";

import { ipsQuestionnaire } from "../../features/step_definitions/helpers/apiMockObjects";
import { getConfigFromEnv } from "../config";

import { callCloudFunction } from "./cloudFunctionCallerHelper";

vi.mock("google-auth-library");
vi.mock("axios");

const config = getConfigFromEnv();
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

  it("should return a 200 status and a json object with message and status if successfully created donor cases", async () => {
    const dummyUrl = config.CreateDonorCasesCloudFunctionUrl;

    const payload = {
      questionnaire_name: ipsQuestionnaire,
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

  it("should return a 500 status and a json object with message and status if failed in creating donor cases", async () => {
    const dummyUrl = config.CreateDonorCasesCloudFunctionUrl;

    const payload = {
      questionnaire_name: ipsQuestionnaire,
      role: "IPS Manager",
    };
    const mockErrorResponse = {
      message: "Error invoking cloud function",
      status: 500,
    };

    mockedAxiosPost.mockResolvedValue({
      data: mockErrorResponse.message,
      status: mockErrorResponse.status,
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
