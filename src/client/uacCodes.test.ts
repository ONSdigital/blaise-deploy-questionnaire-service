import { cleanup } from "@testing-library/react";
import { getCountOfUACs, generateUACCodes, getUACCodesByCaseID } from "./uacCodes";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const mock = new MockAdapter(axios);

describe("Function getCountOfUACs(questionnaireName: string) ", () => {
    const questionnaireName = "OPN2004A";

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });

    it("should return the count as type number", async () => {
        mock.onGet(`/api/uacs/instrument/${questionnaireName}/count`).reply(200, { count: 100 });

        const count = await getCountOfUACs(questionnaireName);
        expect(count).toEqual(100);
    });

    it("should throw an error if object is returned with count not of type number", async () => {
        mock.onGet(`/api/uacs/instrument/${questionnaireName}/count`).reply(200, { count: "100" });

        await expect(getCountOfUACs(questionnaireName)).rejects.toThrow("UAC count was not a number");
    });

    it("should throw an error if request returns an error code", async () => {
        mock.onGet(`/api/uacs/instrument/${questionnaireName}/count`).reply(500);

        await expect(getCountOfUACs(questionnaireName)).rejects.toThrow();
    });

    it("should throw an error if request call fails", async () => {
        mock.onGet(`/api/uacs/instrument/${questionnaireName}/count`).networkError();

        await expect(getCountOfUACs(questionnaireName)).rejects.toThrow();
    });
});

describe("Function generateUACCodes(questionnaireName: string) ", () => {
    const questionnaireName = "OPN2004A";

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });

    it("should return true if a status 200 is returned", async () => {
        mock.onPost(`/api/uacs/instrument/${questionnaireName}`).reply(200);

        const success = await generateUACCodes(questionnaireName);
        expect(success).toBeTruthy();
    });

    it("should return false if request returns an error code", async () => {
        mock.onPost(`/api/uacs/instrument/${questionnaireName}`).reply(500);

        const success = await generateUACCodes(questionnaireName);
        expect(success).toBeFalsy();
    });

    it("should return false if request call fails", async () => {
        mock.onPost(`/api/uacs/instrument/${questionnaireName}/count`).networkError();

        const success = await generateUACCodes(questionnaireName);
        expect(success).toBeFalsy();
    });
});

describe("Function getUACCodesByCaseID(questionnaireName: string) ", () => {
    const questionnaireName = "OPN2004A";

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });

    it("should return true if a status 200 is returned", async () => {
        mock.onGet(`/api/uacs/instrument/${questionnaireName}/bycaseid`).reply(200, {
            "case1": {
                instrument_name: questionnaireName,
                case_id: "case1",
                uac_chunks: { uac1: "1234", uac2: "2345", uac3: "3456" }
            }
        });

        const uacCodeByCase = await getUACCodesByCaseID(questionnaireName);
        expect(uacCodeByCase).toEqual({
            "case1": {
                instrument_name: questionnaireName,
                case_id: "case1",
                uac_chunks: { uac1: "1234", uac2: "2345", uac3: "3456" }
            }
        });
    });

    it("should throw an error if request returns an error code", async () => {
        mock.onGet(`/api/uacs/instrument/${questionnaireName}/bycaseid`).reply(500);

        await expect(getUACCodesByCaseID(questionnaireName)).rejects.toThrow();
    });

    it("should throw an error if request call fails", async () => {
        mock.onGet(`/api/uacs/instrument/${questionnaireName}/bycaseid`).networkError();

        await expect(getUACCodesByCaseID(questionnaireName)).rejects.toThrow();
    });
});
