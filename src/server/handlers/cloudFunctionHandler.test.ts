// it.skip("placeholder", () => { });

import { newServer } from "../server";
import supertest from "supertest";
import CloudFunctionHandler, { callCloudFunctionToCreateDonorCases } from "./cloudFunctionHandler";
import { getConfigFromEnv } from "../config";
import createLogger from "../pino";

interface myInterface {
    message: string;
    status: number;
}

const successResponse = "success";
const errorResponse = "fail";

const config = getConfigFromEnv();

jest.mock("./cloudFunctionHandler", () => {
    const original = jest.requireActual("./cloudFunctionHandler");
    return {
        ...original,
        CallCloudFunction: jest.fn(),
    };
});

const CallCloudFunctionMock = callCloudFunctionToCreateDonorCases as jest.Mock<Promise<string>>;

describe("Get all uptime checks from API", () => {
    it("should return a 200 status and a json object with message and status", async () => {
        process.env.GOOGLE_CLOUD_PROJECT = "example-project-id";
        console.log(CallCloudFunctionMock);
        CallCloudFunctionMock.mockImplementation(() => {
            return Promise.resolve(successResponse);
        });

        const server = newServer(config, createLogger());
        const request = supertest(server);
        const response = await request.get("/api/cloudFunction/createDonorCases");

        expect(response.status).toEqual(200);
        expect(response.body).toEqual(successResponse);
    });

    // it("should return a 500 status if API fails", async () => {
    //     CallCloudFunctionMock.mockReturnValue(Promise.resolve(errorResponse));

    //     const server = newServer(config, createLogger());
    //     const request = supertest(server);
    //     const response = await request.get("/api/cloudFunction/createDonorCases");
    //     expect(response.status).toEqual(500);
    //     expect(response.body).toEqual("Error invoking Cloud function");
    // });

    // afterEach(() => {
    //     jest.clearAllMocks();
    // });
});
