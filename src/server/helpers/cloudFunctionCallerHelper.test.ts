// it.skip("placeholder", () => { });

import { newServer } from "../server";
import supertest from "supertest";
import { getConfigFromEnv } from "../config";
import createLogger from "../pino";
import { callCloudFunctionToCreateDonorCases, getIdTokenFromMetadataServer } from "./cloudFunctionCallerHelper";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { ipsQuestionnaire } from "../../features/step_definitions/helpers/apiMockObjects";

jest.mock('./cloudFunctionCallerHelper');
jest.mock("./cloudFunctionCallerHelper", () => ({
    ...jest.requireActual("./cloudFunctionCallerHelper"),
    callCloudFunctionToCreateDonorCases: jest.fn(), // Directly return a jest mock function
    getIdTokenFromMetadataServer: jest.fn(),

}));
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const config = getConfigFromEnv();

const callCloudFunctionToCreateDonorCasesMock = callCloudFunctionToCreateDonorCases as jest.Mock<Promise<string>>;

const getIdTokenFromMetadataServerMock = getIdTokenFromMetadataServer as jest.Mock<Promise<string>>;


describe("Call Cloud Function to create donor cases and return responses", () => {

    it("should return a 200 status and a json object with message and status if successfully created donor cases", async () => {

        const dummyToken = "dummy-token";
        getIdTokenFromMetadataServerMock.mockResolvedValue(dummyToken);

        const mockResponse = {
            data: 'Success',
            status: 200,
        };

        mockedAxios.post.mockResolvedValueOnce(mockResponse);


        const dummyUrl = config.CreateDonorCasesCloudFunctionUrl;
        //callCloudFunctionToCreateDonorCasesMock.mockImplementation(() => Promise.resolve("Success"));


        // const response = 
        callCloudFunctionToCreateDonorCasesMock(dummyUrl, { questionnaire_name: ipsQuestionnaire, role: "IPS Manager" });
        // expect(response).toEqual("Success");

        expect(mockedAxios.post).toHaveBeenCalledWith(
            dummyUrl,
            { questionnaire_name: ipsQuestionnaire, role: "IPS Manager" },
            { headers: { "Content-Type": "application/json", Authorization: `Bearer ${dummyToken}` } }
        );
    });
});
