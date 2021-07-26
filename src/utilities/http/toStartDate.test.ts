import {mock_server_request_function, mock_server_request_Return_JSON} from "../../tests/utils";
import {cleanup} from "@testing-library/react";
import {deleteTOStartDate, getTOStartDate, setTOStartDate} from "./toStartDate";

describe("Function setTOStartDate(instrumentName: string, toStartDate: string) ", () => {

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

describe("Function getTOStartDate(instrumentName: string) ", () => {

    it("It should return true and a TO start date string if object with the correct name returned", async () => {
        mock_server_request_Return_JSON(200, {"tostartdate": "1997-12-24"});
        const [liveDateSet, toStartDate] = await getTOStartDate("OPN2004A");
        expect(liveDateSet).toBeTruthy();
        expect(toStartDate).toEqual("1997-12-24");
    });

    it("It should return null and a empty string if object with without a To start date is returned", async () => {
        mock_server_request_Return_JSON(200, {name: "BACON"});
        const [liveDateSet, toStartDate] = await getTOStartDate("OPN2004A");
        expect(liveDateSet).toEqual(null);
        expect(toStartDate).toEqual("");
    });

    it("It should return false and a empty string if a 404 is returned from the server", async () => {
        mock_server_request_Return_JSON(404, {});
        const [liveDateSet, toStartDate] = await getTOStartDate("OPN2004A");
        expect(liveDateSet).toBeFalsy();
        expect(toStartDate).toEqual("");
    });

    it("It should return null and a empty string if request returns an error code", async () => {
        mock_server_request_Return_JSON(500, {});
        const [liveDateSet, toStartDate] = await getTOStartDate("OPN2004A");
        expect(liveDateSet).toEqual(null);
        expect(toStartDate).toEqual("");
    });

    it("It should return null and a empty string if request JSON is invalid", async () => {
        mock_server_request_function(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.reject("Failed"),
            })
        );
        const [liveDateSet, toStartDate] = await getTOStartDate("OPN2004A");
        expect(liveDateSet).toEqual(null);
        expect(toStartDate).toEqual("");
    });

    it("It should return null and a empty string if request call fails", async () => {
        mock_server_request_function(() =>
            Promise.resolve(() => {
                throw "error";
            })
        );
        const [liveDateSet, toStartDate] = await getTOStartDate("OPN2004A");
        expect(liveDateSet).toEqual(null);
        expect(toStartDate).toEqual("");
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});

describe("Function deleteTOStartDate(instrumentName: string, toStartDate: string) ", () => {

    it("It should return true if created 204 response is returned", async () => {
        mock_server_request_Return_JSON(204, {});
        const success = await deleteTOStartDate("OPN2004A");
        expect(success).toBeTruthy();
    });

    it("It should return false if a 404 is returned from the server", async () => {
        mock_server_request_Return_JSON(404, {});
        const success = await deleteTOStartDate("OPN2004A");
        expect(success).toBeFalsy();
    });

    it("It should return false if request returns an error code", async () => {
        mock_server_request_Return_JSON(500, {});
        const success = await deleteTOStartDate("OPN2004A");
        expect(success).toEqual(false);
    });

    it("It should return false object if request call fails", async () => {
        mock_server_request_function(() =>
            Promise.resolve(() => {
                throw "error";
            })
        );
        const success = await deleteTOStartDate("OPN2004A");
        expect(success).toEqual(false);
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});
