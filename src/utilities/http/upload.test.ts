import {cleanup} from "@testing-library/react";
import {getAllInstrumentsInBucket, validateUploadIsComplete} from "./upload";
import {mock_server_request_function, mock_server_request_Return_JSON} from "../../tests/utils";


describe("Function validateUploadIsComplete(filename: string) ", () => {

    it("It should return true if object with the correct filename returned", async () => {
        mock_server_request_Return_JSON(200, {name: "OPN2004A.bpkg"});
        const fileFound = await validateUploadIsComplete("OPN2004A.bpkg");
        expect(fileFound).toBeTruthy();
    });

    it("It should return false if object is returned with different filename", async () => {
        mock_server_request_Return_JSON(200, {name: "RandonName.bpkg"});
        const fileFound = await validateUploadIsComplete("OPN2004A.bpkg");
        expect(fileFound).toBeFalsy();
    });

    it("It should return false if request returns an error code", async () => {
        mock_server_request_Return_JSON(500, {name: "OPN2004A.bpkg"});
        const fileFound = await validateUploadIsComplete("OPN2004A.bpkg");
        expect(fileFound).toBeFalsy();
    });

    it("It should return false if request JSON is invalid", async () => {
        mock_server_request_function(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.reject("Failed"),
            })
        );

        const fileFound = await validateUploadIsComplete("OPN2004A.bpkg");
        expect(fileFound).toBeFalsy();
    });

    it("It should return false if request call fails", async () => {
        mock_server_request_function(() =>
            Promise.resolve(() => {
                throw "error";
            })
        );
        const fileFound = await validateUploadIsComplete("OPN2004A.bpkg");
        expect(fileFound).toBeFalsy();
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});

describe("Function getAllInstrumentsInBucket() ", () => {

    const instrumentsInBucket : string[] = ["OPN2101A.bpkg", "OPN2004A.bpkg", "LMS2101_BK2.bpkg"];

    it("It should return true with data if the list is returned successfully", async () => {
        mock_server_request_Return_JSON(200, instrumentsInBucket);
        const [success, instruments] = await getAllInstrumentsInBucket();
        expect(success).toBeTruthy();
        expect(instruments).toEqual(instruments);
    });

    it("It should return true with an empty list if a 404 is returned from the server", async () => {
        mock_server_request_Return_JSON(404, []);
        const [success, instruments] = await getAllInstrumentsInBucket();
        expect(success).toBeTruthy();
        expect(instruments).toEqual([]);
    });

    it("It should return false with an empty list if request returns an error code", async () => {
        mock_server_request_Return_JSON(500, {});
        const [success, instruments] = await getAllInstrumentsInBucket();
        expect(success).toBeFalsy();
        expect(instruments).toEqual([]);
    });

    it("It should return false with an empty list if request JSON is not a list", async () => {
        mock_server_request_function(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.reject("Failed"),
            })
        );
        const [success, instruments] = await getAllInstrumentsInBucket();
        expect(success).toBeFalsy();
        expect(instruments).toEqual([]);
    });

    it("It should return false with an empty list if request JSON is invalid", async () => {
        mock_server_request_Return_JSON(200, {name: "NAME"});
        const [success, instruments] = await getAllInstrumentsInBucket();
        expect(success).toBeFalsy();
        expect(instruments).toEqual([]);
    });

    it("It should return false with an empty list if request call fails", async () => {
        mock_server_request_function(() =>
            Promise.resolve(() => {
                throw "error";
            })
        );
        const [success, instruments] = await getAllInstrumentsInBucket();
        expect(success).toBeFalsy();
        expect(instruments).toEqual([]);
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});
