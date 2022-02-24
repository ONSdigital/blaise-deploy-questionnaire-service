import { cleanup } from "@testing-library/react";
import { getCountOfUACs, generateUACCodes, getUACCodesByCaseID } from "./uacCodes";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const mock = new MockAdapter(axios);

describe("Function getCountOfUACs(instrumentName: string) ", () => {
    const instrumentName = "OPN2004A";

    it("should return the count as type number", async () => {
        mock.onGet(`/api/uacs/instrument/${instrumentName}/count`).reply(200, { count: 100 });

        const count = await getCountOfUACs(instrumentName);
        expect(count).toEqual(100);
    });

    it("should throw an error if object is returned with count not of type number", async () => {
        mock.onGet(`/api/uacs/instrument/${instrumentName}/count`).reply(200, { count: "100" });

        await expect(getCountOfUACs(instrumentName)).rejects.toThrow("UAC count was not a number");
    });

    it("should throw an error if request returns an error code", async () => {
        mock.onGet(`/api/uacs/instrument/${instrumentName}/count`).reply(500);

        await expect(getCountOfUACs(instrumentName)).rejects.toThrow();
    });

    it("should throw an error if request call fails", async () => {
        mock.onGet(`/api/uacs/instrument/${instrumentName}/count`).networkError();

        await expect(getCountOfUACs(instrumentName)).rejects.toThrow();
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
    mock.reset();
});

describe("Function generateUACCodes(instrumentName: string) ", () => {
    const instrumentName = "OPN2004A";

    it("should return true if a status 200 is returned", async () => {
        mock.onPost(`/api/uacs/instrument/${instrumentName}`).reply(200);

        const success = await generateUACCodes(instrumentName);
        expect(success).toBeTruthy();
    });

    it("should return false if request returns an error code", async () => {
        mock.onPost(`/api/uacs/instrument/${instrumentName}`).reply(500);

        const success = await generateUACCodes(instrumentName);
        expect(success).toBeFalsy();
    });

    it("should return false if request call fails", async () => {
        mock.onPost(`/api/uacs/instrument/${instrumentName}/count`).networkError();

        const success = await generateUACCodes(instrumentName);
        expect(success).toBeFalsy();
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
    mock.reset();
});

describe("Function getUACCodesByCaseID(instrumentName: string) ", () => {
    const instrumentName = "OPN2004A";

    it("should return true if a status 200 is returned", async () => {
        mock.onGet(`/api/uacs/instrument/${instrumentName}/bycaseid`).reply(200, {
            "case1": {
                instrument_name: instrumentName,
                case_id: "case1",
                uac_chunks: { uac1: "1234", uac2: "2345", uac3: "3456" }
            }
        });

        const uacCodeByCase = await getUACCodesByCaseID(instrumentName);
        expect(uacCodeByCase).toEqual({
            "case1": {
                instrument_name: instrumentName,
                case_id: "case1",
                uac_chunks: { uac1: "1234", uac2: "2345", uac3: "3456" }
            }
        });
    });

    it("should throw an error if request returns an error code", async () => {
        mock.onGet(`/api/uacs/instrument/${instrumentName}/bycaseid`).reply(500);

        await expect(getUACCodesByCaseID(instrumentName)).rejects.toThrow();
    });

    it("should throw an error if request call fails", async () => {
        mock.onGet(`/api/uacs/instrument/${instrumentName}/bycaseid`).networkError();

        await expect(getUACCodesByCaseID(instrumentName)).rejects.toThrow();
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });
});
