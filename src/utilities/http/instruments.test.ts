import {cleanup} from "@testing-library/react";
import {mock_server_request_function, mock_server_request_Return_JSON} from "../../tests/utils";
import {instrumentList, opnInstrument} from "../../features/step_definitions/API_Mock_Objects";
import {
    checkInstrumentAlreadyExists,
    deleteInstrument,
    doesInstrumentHaveCAWIMode,
    getAllInstruments,
    sendInstallRequest
} from "./instruments";

describe("Function checkInstrumentAlreadyExists(instrumentName: string) ", () => {

    it("It should return true and the instrument object if object with the correct name returned", async () => {
        mock_server_request_Return_JSON(200, opnInstrument);
        const [alreadyExists, instrument] = await checkInstrumentAlreadyExists("OPN2004A");
        expect(alreadyExists).toBeTruthy();
        expect(instrument).toEqual(opnInstrument);
    });

    it("It should return false and a null object if object with an incorrect name returned", async () => {
        mock_server_request_Return_JSON(200, {name: "BACON"});
        const [alreadyExists, instrument] = await checkInstrumentAlreadyExists("OPN2004A");
        expect(alreadyExists).toBeFalsy();
        expect(instrument).toEqual(null);
    });

    it("It should return false and a null object if a 404 is returned from the server", async () => {
        mock_server_request_Return_JSON(404, {});
        const [alreadyExists, instrument] = await checkInstrumentAlreadyExists("OPN2004A");
        expect(alreadyExists).toBeFalsy();
        expect(instrument).toEqual(null);
    });

    it("It should return null and a null object if request returns an error code", async () => {
        mock_server_request_Return_JSON(500, {});
        const [alreadyExists, instrument] = await checkInstrumentAlreadyExists("OPN2004A");
        expect(alreadyExists).toEqual(null);
        expect(instrument).toEqual(null);
    });

    it("It should return null and a null object if request JSON is invalid", async () => {
        mock_server_request_function(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.reject("Failed"),
            })
        );
        const [alreadyExists, instrument] = await checkInstrumentAlreadyExists("OPN2004A");
        expect(alreadyExists).toEqual(null);
        expect(instrument).toEqual(null);
    });

    it("It should return null and a null object if request call fails", async () => {
        mock_server_request_function(() =>
            Promise.resolve(() => {
                throw "error";
            })
        );
        const [alreadyExists, instrument] = await checkInstrumentAlreadyExists("OPN2004A");
        expect(alreadyExists).toEqual(null);
        expect(instrument).toEqual(null);
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});


describe("Function getAllInstruments(filename: string) ", () => {

    it("It should return true with data if the list is returned successfully", async () => {
        mock_server_request_Return_JSON(200, instrumentList);
        const [success, instruments] = await getAllInstruments();
        expect(success).toBeTruthy();
        expect(instruments).toEqual(instruments);
    });

    it("It should return true with an empty list if a 404 is returned from the server", async () => {
        mock_server_request_Return_JSON(404, []);
        const [success, instruments] = await getAllInstruments();
        expect(success).toBeTruthy();
        expect(instruments).toEqual([]);
    });

    it("It should return false with an empty list if request returns an error code", async () => {
        mock_server_request_Return_JSON(500, {});
        const [success, instruments] = await getAllInstruments();
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
        const [success, instruments] = await getAllInstruments();
        expect(success).toBeFalsy();
        expect(instruments).toEqual([]);
    });

    it("It should return false with an empty list if request JSON is invalid", async () => {
        mock_server_request_Return_JSON(200, {name: "NAME"});
        const [success, instruments] = await getAllInstruments();
        expect(success).toBeFalsy();
        expect(instruments).toEqual([]);
    });

    it("It should return false with an empty list if request call fails", async () => {
        mock_server_request_function(() =>
            Promise.resolve(() => {
                throw "error";
            })
        );
        const [success, instruments] = await getAllInstruments();
        expect(success).toBeFalsy();
        expect(instruments).toEqual([]);
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});

describe("Function deleteInstrument(instrumentName: string) ", () => {

    it("It should return true if created 204 response is returned", async () => {
        mock_server_request_Return_JSON(204, {});
        const success = await deleteInstrument("OPN2004A");
        expect(success).toBeTruthy();
    });

    it("It should return false if a 404 is returned from the server", async () => {
        mock_server_request_Return_JSON(404, {});
        const success = await deleteInstrument("OPN2004A");
        expect(success).toEqual([false, ""]);
    });

    it("It should return false if request returns an error code", async () => {
        mock_server_request_Return_JSON(500, {});
        const success = await deleteInstrument("OPN2004A");
        expect(success).toEqual([false, ""]);
    });

    it("It should return false object if request call fails", async () => {
        mock_server_request_function(() =>
            Promise.resolve(() => {
                throw "error";
            })
        );
        const success = await deleteInstrument("OPN2004A");
        expect(success).toEqual([false, ""]);
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});

describe("Function sendInstallRequest(instrumentName: string) ", () => {

    it("It should return true if created 201 response is returned", async () => {
        mock_server_request_Return_JSON(201, {});
        const success = await sendInstallRequest("OPN2004A");
        expect(success).toBeTruthy();
    });

    it("It should return false if a 404 is returned from the server", async () => {
        mock_server_request_Return_JSON(404, {});
        const success = await sendInstallRequest("OPN2004A");
        expect(success).toBeFalsy();
    });

    it("It should return false if request returns an error code", async () => {
        mock_server_request_Return_JSON(500, {});
        const success = await sendInstallRequest("OPN2004A");
        expect(success).toEqual(false);
    });

    it("It should return false object if request call fails", async () => {
        mock_server_request_function(() =>
            Promise.resolve(() => {
                throw "error";
            })
        );
        const success = await sendInstallRequest("OPN2004A");
        expect(success).toEqual(false);
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});

describe("Function doesInstrumentHaveCAWIMode(instrumentName: string) ", () => {

    it("It should return true if created 200 response is returned", async () => {
        mock_server_request_Return_JSON(200, true);
        const success = await doesInstrumentHaveCAWIMode("OPN2004A");
        expect(success).toBeTruthy();
    });

    it("It should return false if a 404 is returned from the server", async () => {
        mock_server_request_Return_JSON(404, {});
        const success = await doesInstrumentHaveCAWIMode("OPN2004A");
        expect(success).toBeFalsy();
    });

    it("It should return null if request returns an error code", async () => {
        mock_server_request_Return_JSON(500, {});
        const success = await doesInstrumentHaveCAWIMode("OPN2004A");
        expect(success).toEqual(null);
    });

    it("It should return null object if request call fails", async () => {
        mock_server_request_function(() =>
            Promise.resolve(() => {
                throw "error";
            })
        );
        const success = await doesInstrumentHaveCAWIMode("OPN2004A");
        expect(success).toEqual(null);
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});
