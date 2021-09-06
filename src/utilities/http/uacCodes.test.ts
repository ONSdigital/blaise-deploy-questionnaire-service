import {mock_server_request_function, mock_server_request_Return_JSON} from "../../tests/utils";
import {cleanup} from "@testing-library/react";
import {getCountOfUACs} from "./uacCodes";

describe("Function getCountOfUACs(instrumentName: string) ", () => {
    const instrumentName = "OPN2004A";

    it("It should return true if object with count as type number is returned", async () => {
        mock_server_request_Return_JSON(200, {count: 100});
        const count = await getCountOfUACs(instrumentName);
        expect(count).toBeTruthy();
    });

    it("It should return false if object is returned with count not of type number", async () => {
        mock_server_request_Return_JSON(200, {count: "100"});
        const count = await getCountOfUACs(instrumentName);
        expect(count).toBeFalsy();
    });

    it("It should return false if request returns an error code", async () => {
        mock_server_request_Return_JSON(500, {});
        const count = await getCountOfUACs(instrumentName);
        expect(count).toBeFalsy();
    });

    it("It should return false if request JSON is invalid", async () => {
        mock_server_request_function(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.reject("Failed"),
            })
        );

        const count = await getCountOfUACs(instrumentName);
        expect(count).toBeFalsy();
    });

    it("It should return false if request call fails", async () => {
        mock_server_request_function(() =>
            Promise.resolve(() => {
                throw "error";
            })
        );
        const count = await getCountOfUACs(instrumentName);
        expect(count).toBeFalsy();
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});
