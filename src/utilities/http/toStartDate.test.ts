import {mock_server_request_function, mock_server_request_Return_JSON} from "../../tests/utils";
import {cleanup} from "@testing-library/react";
import {setTOStartDate} from "./toStartDate";

describe("Function setLiveDate(instrumentName: string, liveDate: string) ", () => {

    it("It should return true if created 201 response is returned", async () => {
        mock_server_request_Return_JSON(201, {});
        const success = await setTOStartDate("OPN2004A", "2020-01-01");
        expect(success).toBeTruthy();
    });

    it("It should return false if a 404 is returned from the server", async () => {
        mock_server_request_Return_JSON(404, {});
        const success = await setTOStartDate("OPN2004A", "2020-01-01");
        expect(success).toBeFalsy();
    });

    it("It should return false if request returns an error code", async () => {
        mock_server_request_Return_JSON(500, {});
        const success = await setTOStartDate("OPN2004A", "2020-01-01");
        expect(success).toEqual(false);
    });

    it("It should return false object if request call fails", async () => {
        mock_server_request_function(() =>
            Promise.resolve(() => {
                throw "error";
            })
        );
        const success = await setTOStartDate("OPN2004A", "2020-01-01");
        expect(success).toEqual(false);
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});
