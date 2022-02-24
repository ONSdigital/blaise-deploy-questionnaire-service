import { cleanup } from "@testing-library/react";
import { mock_server_request_function, mock_server_request_Return_JSON } from "../tests/utils";
import { instrumentList, opnInstrument } from "../features/step_definitions/helpers/apiMockObjects";
import {
    getInstrument,
    deleteInstrument,
    activateInstrument,
    deactivateInstrument,
    getAllInstruments,
    getInstrumentModes,
    sendInstallRequest
} from "./instruments";

import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const mock = new MockAdapter(axios);

describe("Function getInstrument(instrumentName: string) ", () => {

    it("should return true and the instrument object if object with the correct name returned", async () => {
        mock.onGet("/api/instruments/OPN2004A").reply(200, opnInstrument);
        mock_server_request_Return_JSON(200, opnInstrument);
        const instrument = await getInstrument("OPN2004A");
        expect(instrument).toEqual(opnInstrument);
    });

    it("should return undefined if a 404 is returned from the server", async () => {
        mock.onGet("/api/instruments/OPN2004A").reply(404, {});
        const instrument = await getInstrument("OPN2004A");
        expect(instrument).toBeUndefined();
    });

    it("should throw an error if request returns an error code", async () => {
        mock.onGet("/api/instruments/OPN2004A").reply(500, {});
        await expect(getInstrument("OPN2004A")).rejects.toThrow();
    });

    it("should thrown an error if request call fails", async () => {
        mock.onGet("/api/instruments/OPN2004A").networkError();
        await expect(getInstrument("OPN2004A")).rejects.toThrow();
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});


describe("Function getAllInstruments(filename: string) ", () => {

    it("should return true with data if the list is returned successfully", async () => {
        mock_server_request_Return_JSON(200, instrumentList);
        const [success, instruments] = await getAllInstruments();
        expect(success).toBeTruthy();
        expect(instruments).toEqual(instruments);
    });

    it("should return false with an empty list if a 404 is returned from the server", async () => {
        mock_server_request_Return_JSON(404, []);
        const [success, instruments] = await getAllInstruments();
        expect(success).toBeFalsy();
        expect(instruments).toEqual([]);
    });

    it("should return false with an empty list if request returns an error code", async () => {
        mock_server_request_Return_JSON(500, {});
        const [success, instruments] = await getAllInstruments();
        expect(success).toBeFalsy();
        expect(instruments).toEqual([]);
    });

    it("should return false with an empty list if request JSON is not a list", async () => {
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

    it("should return false with an empty list if request JSON is invalid", async () => {
        mock_server_request_Return_JSON(200, { name: "NAME" });
        const [success, instruments] = await getAllInstruments();
        expect(success).toBeFalsy();
        expect(instruments).toEqual([]);
    });

    it("should return false with an empty list if request call fails", async () => {
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

    it("should return true if created 204 response is returned", async () => {
        mock_server_request_Return_JSON(204, {});
        const success = await deleteInstrument("OPN2004A");
        expect(success).toBeTruthy();
    });

    it("should return false if a 404 is returned from the server", async () => {
        mock_server_request_Return_JSON(404, {});
        const success = await deleteInstrument("OPN2004A");
        expect(success).toEqual([false, ""]);
    });

    it("should return false if request returns an error code", async () => {
        mock_server_request_Return_JSON(500, {});
        const success = await deleteInstrument("OPN2004A");
        expect(success).toEqual([false, ""]);
    });

    it("should return false object if request call fails", async () => {
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

describe("Function activateInstrument(instrumentName: string) ", () => {

    it("should return true if created 204 response is returned", async () => {
        mock_server_request_Return_JSON(204, {});
        const success = await activateInstrument("OPN2004A");
        expect(success).toBeTruthy();
    });

    it("should return false if a 404 is returned from the server", async () => {
        mock_server_request_Return_JSON(404, {});
        const success = await activateInstrument("OPN2004A");
        expect(success).toBeFalsy();
    });

    it("should return false if request returns an error code", async () => {
        mock_server_request_Return_JSON(500, {});
        const success = await activateInstrument("OPN2004A");
        expect(success).toBeFalsy();
    });

    it("should return false object if request call fails", async () => {
        mock_server_request_function(() =>
            Promise.resolve(() => {
                throw "error";
            })
        );
        const success = await activateInstrument("OPN2004A");
        expect(success).toBeFalsy();
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});

describe("Function deactivateInstrument(instrumentName: string) ", () => {

    it("should return true if created 204 response is returned", async () => {
        mock_server_request_Return_JSON(204, {});
        const success = await deactivateInstrument("OPN2004A");
        expect(success).toBeTruthy();
    });

    it("should return false if a 404 is returned from the server", async () => {
        mock_server_request_Return_JSON(404, {});
        const success = await deactivateInstrument("OPN2004A");
        expect(success).toBeFalsy();
    });

    it("should return false if request returns an error code", async () => {
        mock_server_request_Return_JSON(500, {});
        const success = await deactivateInstrument("OPN2004A");
        expect(success).toBeFalsy();
    });

    it("should return false object if request call fails", async () => {
        mock_server_request_function(() =>
            Promise.resolve(() => {
                throw "error";
            })
        );
        const success = await deactivateInstrument("OPN2004A");
        expect(success).toBeFalsy();
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});

describe("Function sendInstallRequest(instrumentName: string) ", () => {

    it("should return true if created 201 response is returned", async () => {
        mock_server_request_Return_JSON(201, {});
        const success = await sendInstallRequest("OPN2004A");
        expect(success).toBeTruthy();
    });

    it("should return false if a 404 is returned from the server", async () => {
        mock_server_request_Return_JSON(404, {});
        const success = await sendInstallRequest("OPN2004A");
        expect(success).toBeFalsy();
    });

    it("should return false if request returns an error code", async () => {
        mock_server_request_Return_JSON(500, {});
        const success = await sendInstallRequest("OPN2004A");
        expect(success).toEqual(false);
    });

    it("should return false object if request call fails", async () => {
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

describe("Function getInstrumentModes(instrumentName: string)", () => {

    it("should return true if created 200 response is returned", async () => {
        mock_server_request_Return_JSON(200, true);
        const success = await getInstrumentModes("OPN2004A");
        expect(success).toBeTruthy();
    });

    it("should return null if a 404 is returned from the server", async () => {
        mock_server_request_Return_JSON(404, {});
        const success = await getInstrumentModes("OPN2004A");
        expect(success).toEqual([]);
    });

    it("should return null if request returns an error code", async () => {
        mock_server_request_Return_JSON(500, {});
        const success = await getInstrumentModes("OPN2004A");
        expect(success).toEqual([]);
    });

    it("should return null object if request call fails", async () => {
        mock_server_request_function(() =>
            Promise.resolve(() => {
                throw "error";
            })
        );
        const success = await getInstrumentModes("OPN2004A");
        expect(success).toEqual([]);
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});
