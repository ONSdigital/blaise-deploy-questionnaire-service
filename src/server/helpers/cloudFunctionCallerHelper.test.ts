import { getConfigFromEnv } from "../config";
import { callCloudFunction } from "./cloudFunctionCallerHelper";
import axios from "axios";
import { ipsQuestionnaire } from "../../features/step_definitions/helpers/apiMockObjects";
import { GoogleAuth } from "google-auth-library";

jest.mock("google-auth-library");
jest.mock("axios");

const config = getConfigFromEnv();

describe("Call Cloud Function to create donor cases and return responses", () => {
    let mockGetIdTokenClient: jest.Mock;
    let mockFetchIdToken: jest.Mock;
    const dummyToken = process.env.AUTH_TOKEN;

    beforeEach(() => {
        mockFetchIdToken = jest.fn().mockResolvedValue(dummyToken);
        mockGetIdTokenClient = jest.fn().mockResolvedValue({
            idTokenProvider: {
                fetchIdToken: mockFetchIdToken,
            },
        });
        (GoogleAuth as unknown as jest.Mock).mockImplementation(() => ({
            getIdTokenClient: mockGetIdTokenClient,
        }));
    });

    afterEach(() => {
        jest.resetAllMocks();
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
        (axios.post as jest.Mock).mockResolvedValue({
            data: mockSuccessResponse.message,
            status: mockSuccessResponse.status,
        });

        const result = await callCloudFunction(
            dummyUrl,
            payload
        );

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
        (axios.post as jest.Mock).mockResolvedValue({
            data: mockErrorResponse.message,
            status: mockErrorResponse.status,
        });

        const result = await callCloudFunction(
            dummyUrl,
            payload
        );

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
