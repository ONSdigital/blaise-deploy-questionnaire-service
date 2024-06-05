it.skip("placeholder", () => {});

// import newServer from "../server";
// import supertest from "supertest";
// import BlaiseApiClient from "blaise-api-node-client";
// import CloudFunctionHandler, {
//     callCloudFunctionToCreateDonorCases,
// } from "./cloudFunctionHandler";
// import { getConfigFromEnv } from "../config";

// interface myInterface {
//     message: string;
//     status: number;
// }

// const exampleResponse: myInterface = {
//     message: "Much wow!",
//     status: 200,
// };

// const config = getConfigFromEnv();

// jest.mock("/api/cloudFunction/createDonorCases", () => {
//     const original = jest.requireActual("../cloudFunctionHandler");
//     return {
//         ...original,
//         CallCloudFunction: jest.fn(),
//     };
// });

// const CallCloudFunctionMock =
//     callCloudFunctionToCreateDonorCases as unknown as jest.Mock<
//         Promise<myInterface[]>
//     >;

// describe("Get all uptime checks from API", () => {
//     it("should return a 200 status and a json list of 1 items when API returns a 1 item list", async () => {
//         process.env.GOOGLE_CLOUD_PROJECT = "example-project-id";
//         getMonitoringUptimeCheckTimeSeriesMock.mockReturnValue(
//             Promise.resolve(mockHealthCheckList)
//         );

//         const server = NewServer(blaiseApiClient, cache, config);
//         const request = supertest(server);
//         const response = await request.get("/api/monitoring");

//         expect(response.status).toEqual(200);
//         expect(response.body).toEqual(mockHealthCheckList);
//         const [googleMonitoringApi] = getMonitoringUptimeCheckTimeSeriesMock
//             .mock.calls[0] as GoogleMonitoringApi[];
//         expect(googleMonitoringApi.projectId).toEqual("example-project-id");
//     });

//     it("should return a 500 status direct from the API", async () => {
//         getMonitoringUptimeCheckTimeSeriesMock.mockImplementation(() =>
//             Promise.reject("Error getting uptime checks")
//         );

//         const server = NewServer(blaiseApiClient, cache, config);
//         const request = supertest(server);
//         const response = await request.get("/api/monitoring");
//         expect(response.status).toEqual(500);
//         expect(response.body).toEqual(
//             "Failed to get monitoring uptimeChecks config data"
//         );
//     });

//     afterEach(() => {
//         jest.clearAllMocks();
//         jest.resetModules();
//         cache.flushAll();
//     });
// });
