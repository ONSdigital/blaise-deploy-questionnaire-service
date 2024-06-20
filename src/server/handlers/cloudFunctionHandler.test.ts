// it.skip("placeholder", () => { });

import { newServer } from "../server";
import supertest from "supertest";
import { getConfigFromEnv } from "../config";
import createLogger from "../pino";
import { callCloudFunctionToCreateDonorCases } from "../helpers/cloudFunctionCallerHelper";
import { cloudFunctionAxiosError } from "../../features/step_definitions/helpers/apiMockObjects";

jest.mock("../helpers/cloudFunctionCallerHelper");
const successResponse = {
    message: "Success",
    status: 200,
};

const config = getConfigFromEnv();
const callCloudFunctionToCreateDonorCasesMock = callCloudFunctionToCreateDonorCases as jest.Mock<Promise<{ message: string, status: number }>>;

describe("Call Cloud Function to create donor cases and return responses", () => {
    let request: supertest.SuperTest<supertest.Test>;
  
    beforeEach(() => {
        request = supertest(newServer(config, createLogger()));
    });
  
    afterEach(() => {
        jest.clearAllMocks(); 
    });
  
    it("should return a 200 status and a json object with message and status if successfully created donor cases", async () => {
        callCloudFunctionToCreateDonorCasesMock.mockResolvedValue(successResponse);
  
        const response = await request.post("/api/cloudFunction/createDonorCases");
  
        expect(response.status).toEqual(200);
        expect(response.body).toEqual(successResponse);
    });
  
    it("should return a 500 status and a json object with message and status if cloud function failed creating donor cases", async () => {
        callCloudFunctionToCreateDonorCasesMock.mockRejectedValue(cloudFunctionAxiosError);
  
        const response = await request.post("/api/cloudFunction/createDonorCases");
  
        expect(response.status).toEqual(500);
        expect(response.body.message).toEqual((cloudFunctionAxiosError as any).response.data);
    });
});
