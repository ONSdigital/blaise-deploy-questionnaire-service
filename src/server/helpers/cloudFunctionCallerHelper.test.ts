it.skip("placeholder", () => { });

// import { newServer } from "../server";
// import supertest from "supertest";
// import { getConfigFromEnv } from "../config";
// import createLogger from "../pino";
// import { getIdTokenFromMetadataServer } from "./cloudFunctionCallerHelper";

// jest.mock('.cloudFunctionCallerHelper');
// const successResponse = "success";
// const errorResponse = "error";

// const config = getConfigFromEnv();
// const callCloudFunctionToCreateDonorCasesMock = callCloudFunctionToCreateDonorCases as jest.Mock<Promise<string>>;

// describe("Call Cloud Function to create donor cases and return responses", () => {

//     it("should return a 200 status and a json object with message and status if successfully created donor cases", async () => {

//         const request = supertest(newServer(config, createLogger()));

//         callCloudFunctionToCreateDonorCasesMock.mockResolvedValue(successResponse);

//         const response = await request.post("/api/cloudFunction/createDonorCases");

//         expect(response.status).toEqual(200);
//         expect(response.body).toEqual(successResponse);
//     });

//     it("should return a 500 status and a json object with message and status if cloud function failed creating donor cases", async () => {

//         const request = supertest(newServer(config, createLogger()));

//         callCloudFunctionToCreateDonorCasesMock.mockRejectedValue(errorResponse);

//         const response = await request.post("/api/cloudFunction/createDonorCases");

//         expect(response.status).toEqual(500);
//         expect(response.body).toEqual(errorResponse);
//     });
// });
