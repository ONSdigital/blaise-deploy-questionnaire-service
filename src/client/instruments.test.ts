import { cleanup } from "@testing-library/react";
import { instrumentList, opnInstrument } from "../features/step_definitions/helpers/apiMockObjects";
import {
    getInstrument,
    deleteInstrument,
    activateInstrument,
    deactivateInstrument,
    getInstruments,
    getInstrumentModes,
    installInstrument,
    getInstrumentSettings,
    getInstrumentCaseIds
} from "./instruments";

import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const mock = new MockAdapter(axios);

describe("Function getInstrument(instrumentName: string) ", () => {
    it("should return true and the instrument object if object with the correct name returned", async () => {
        mock.onGet("/api/instruments/OPN2004A").reply(200, opnInstrument);

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
        mock.reset();
    });
});


describe("Function getInstruments(filename: string) ", () => {
    it("should return true with data if the list is returned successfully", async () => {
        mock.onGet("/api/instruments").reply(200, instrumentList);

        const instruments = await getInstruments();
        expect(instruments).toEqual(instruments);
    });

    it("should throw an error if a 404 is returned from the server", async () => {
        mock.onGet("/api/instruments").reply(404, []);

        await expect(getInstruments()).rejects.toThrow();
    });

    it("should throw an error if request returns an error code", async () => {
        mock.onGet("/api/instruments").reply(500, []);

        await expect(getInstruments()).rejects.toThrow();
    });

    it("should throw an error if request call fails", async () => {
        mock.onGet("/api/instruments").networkError();

        await expect(getInstruments()).rejects.toThrow();
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });
});

describe("Function deleteInstrument(instrumentName: string) ", () => {
    it("should return true if created 204 response is returned", async () => {
        mock.onDelete("/api/instruments/OPN2004A").reply(204);

        const success = await deleteInstrument("OPN2004A");
        expect(success).toBeTruthy();
    });

    it("should return false if a 404 is returned from the server", async () => {
        mock.onDelete("/api/instruments/OPN2004A").reply(404);

        const success = await deleteInstrument("OPN2004A");
        expect(success).toBeFalsy();
    });

    it("should return false if request returns an error code", async () => {
        mock.onDelete("/api/instruments/OPN2004A").reply(500);

        const success = await deleteInstrument("OPN2004A");
        expect(success).toBeFalsy();
    });

    it("should return false object if request call fails", async () => {
        mock.onDelete("/api/instruments/OPN2004A").networkError();

        const success = await deleteInstrument("OPN2004A");
        expect(success).toBeFalsy();
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });
});

describe("Function activateInstrument(instrumentName: string) ", () => {
    it("should return true if created 204 response is returned", async () => {
        mock.onPatch("/api/instruments/OPN2004A/activate").reply(204);

        const success = await activateInstrument("OPN2004A");
        expect(success).toBeTruthy();
    });

    it("should return false if a 404 is returned from the server", async () => {
        mock.onPatch("/api/instruments/OPN2004A/activate").reply(404);

        const success = await activateInstrument("OPN2004A");
        expect(success).toBeFalsy();
    });

    it("should return false if request returns an error code", async () => {
        mock.onPatch("/api/instruments/OPN2004A/activate").reply(500);

        const success = await activateInstrument("OPN2004A");
        expect(success).toBeFalsy();
    });

    it("should return false object if request call fails", async () => {
        mock.onPatch("/api/instruments/OPN2004A/activate").networkError();

        const success = await activateInstrument("OPN2004A");
        expect(success).toBeFalsy();
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });
});

describe("Function deactivateInstrument(instrumentName: string) ", () => {
    it("should return true if created 204 response is returned", async () => {
        mock.onPatch("/api/instruments/OPN2004A/deactivate").reply(204);

        const success = await deactivateInstrument("OPN2004A");
        expect(success).toBeTruthy();
    });

    it("should return false if a 404 is returned from the server", async () => {
        mock.onPatch("/api/instruments/OPN2004A/deactivate").reply(404);

        const success = await deactivateInstrument("OPN2004A");
        expect(success).toBeFalsy();
    });

    it("should return false if request returns an error code", async () => {
        mock.onPatch("/api/instruments/OPN2004A/deactivate").reply(500);

        const success = await deactivateInstrument("OPN2004A");
        expect(success).toBeFalsy();
    });

    it("should return false object if request call fails", async () => {
        mock.onPatch("/api/instruments/OPN2004A/deactivate").networkError();

        const success = await deactivateInstrument("OPN2004A");
        expect(success).toBeFalsy();
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});

describe("Function installInstrument(instrumentName: string) ", () => {
    it("should return true if created 201 response is returned", async () => {
        mock.onPost("/api/install").reply(201, { filename: "OPN2004A" });

        const success = await installInstrument("OPN2004A");
        expect(success).toBeTruthy();
    });

    it("should return false if a 404 is returned from the server", async () => {
        mock.onPost("/api/install").reply(404, {});

        const success = await installInstrument("OPN2004A");
        expect(success).toBeFalsy();
    });

    it("should return false if request returns an error code", async () => {
        mock.onPost("/api/install").reply(500, {});

        const success = await installInstrument("OPN2004A");
        expect(success).toEqual(false);
    });

    it("should return false object if request call fails", async () => {
        mock.onPost("/api/install").networkError();

        const success = await installInstrument("OPN2004A");
        expect(success).toEqual(false);
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });
});

describe("Function getInstrumentModes(instrumentName: string)", () => {
    it("should return true if created 200 response is returned", async () => {
        mock.onGet("/api/instruments/OPN2004A/modes").reply(200, ["CAWI", "CATI"]);

        const modes = await getInstrumentModes("OPN2004A");
        expect(modes).toEqual(["CAWI", "CATI"]);
    });

    it("should throw an error if a 404 is returned from the server", async () => {
        mock.onGet("/api/instruments/OPN2004A/modes").reply(404, []);

        await expect(getInstrumentModes("OPN2004A")).rejects.toThrow();
    });

    it("should throw an error if request returns an error code", async () => {
        mock.onGet("/api/instruments/OPN2004A/modes").reply(500, []);

        await expect(getInstrumentModes("OPN2004A")).rejects.toThrow();
    });

    it("should throw an error object if request call fails", async () => {
        mock.onGet("/api/instruments/OPN2004A/modes").networkError();

        await expect(getInstrumentModes("OPN2004A")).rejects.toThrow();
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });
});


describe("Function getInstrumentSettings(instrumentName: string)", () => {
    it("should return true if created 200 response is returned", async () => {
        mock.onGet("/api/instruments/OPN2004A/settings").reply(200, []);

        const settings = await getInstrumentSettings("OPN2004A");
        expect(settings).toEqual([]);
    });

    it("should throw an error if a 404 is returned from the server", async () => {
        mock.onGet("/api/instruments/OPN2004A/settings").reply(404, []);

        await expect(getInstrumentSettings("OPN2004A")).rejects.toThrow();
    });

    it("should throw an error if request returns an error code", async () => {
        mock.onGet("/api/instruments/OPN2004A/settings").reply(500, []);

        await expect(getInstrumentSettings("OPN2004A")).rejects.toThrow();
    });

    it("should throw an error object if request call fails", async () => {
        mock.onGet("/api/instruments/OPN2004A/settings").networkError();

        await expect(getInstrumentSettings("OPN2004A")).rejects.toThrow();
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });
});

describe("Function getInstruments(filename: string) ", () => {
    it("should return true with data if the list is returned successfully", async () => {
        mock.onGet("/api/instruments/OPN2004A/cases/ids").reply(200, []);

        const caseIDs = await getInstrumentCaseIds("OPN2004A");
        expect(caseIDs).toEqual([]);
    });

    it("should throw an error if a 404 is returned from the server", async () => {
        mock.onGet("/api/instruments/OPN2004A/cases/ids").reply(404, []);

        await expect(getInstrumentCaseIds("OPN2004A")).rejects.toThrow();
    });

    it("should throw an error if request returns an error code", async () => {
        mock.onGet("/api/instruments/OPN2004A/cases/ids").reply(500, []);

        await expect(getInstrumentCaseIds("OPN2004A")).rejects.toThrow();
    });

    it("should throw an error if request call fails", async () => {
        mock.onGet("/api/instruments/OPN2004A/cases/ids").networkError();

        await expect(getInstrumentCaseIds("OPN2004A")).rejects.toThrow();
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });
});
