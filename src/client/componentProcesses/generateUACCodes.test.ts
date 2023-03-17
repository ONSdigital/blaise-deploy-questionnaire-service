import { InstrumentUacDetails } from "bus-api-node-client";
import { generateUACCodesAndCSVFileData, mapCasesToUACCodes } from "./generateUACCodes";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

describe("generateUACCodesAndCSVFileData(instrumentName: string)", () => {
    const instrumentName = "dst2106a";
    const caseIDs = ["0008", "0009"];
    const uacCodes: InstrumentUacDetails = {
        "0008": {
            case_id: "0008",
            instrument_name: "dst2106a",
            uac_chunks: {
                uac1: "0008",
                uac2: "4545",
                uac3: "9373"
            },
            full_uac: "000845459373"
        },
        "0009": {
            case_id: "0009",
            instrument_name: "dst2106a",
            uac_chunks: {
                uac1: "0009",
                uac2: "3454",
                uac3: "4521"
            },
            full_uac: "000934544521"
        },
    };

    afterEach(() => {
        mock.reset();
    });

    it("should return a list of matched cases", async () => {
        mock.onPost(`/api/uacs/instrument/${instrumentName}`).reply(200);
        mock.onGet(`/api/uacs/instrument/${instrumentName}/bycaseid`).reply(200, uacCodes);
        mock.onGet(`/api/questionnaires/${instrumentName}/cases/ids`).reply(200, caseIDs);

        const mergedCases = await generateUACCodesAndCSVFileData(instrumentName);

        expect(Object.keys(mergedCases).length).toEqual(2);
        expect(mergedCases).toEqual([
            { "UAC1": "0008", "UAC2": "4545", "UAC3": "9373", "UAC": "000845459373", "serial_number": "0008" },
            { "UAC1": "0009", "UAC2": "3454", "UAC3": "4521", "UAC": "000934544521", "serial_number": "0009" }
        ]
        );
    });

    it("should throw error when UAC generation fails", async () => {
        mock.onPost(`/api/uacs/instrument/${instrumentName}`).reply(500);
        mock.onGet(`/api/uacs/instrument/${instrumentName}/bycaseid`).reply(200, uacCodes);
        mock.onGet(`/api/questionnaires/${instrumentName}/cases/ids`).reply(200, caseIDs);

        await expect(generateUACCodesAndCSVFileData(instrumentName))
            .rejects
            .toThrow("Failed to generate UAC codes");
    });

    it("should throw error when get UACs fails", async () => {
        mock.onPost(`/api/uacs/instrument/${instrumentName}`).reply(200);
        mock.onGet(`/api/uacs/instrument/${instrumentName}/bycaseid`).reply(500);
        mock.onGet(`/api/questionnaires/${instrumentName}/cases/ids`).reply(200, caseIDs);

        await expect(generateUACCodesAndCSVFileData(instrumentName))
            .rejects
            .toThrow("Failed to get UAC codes by case ID");
    });

    it("should throw error when get Case IDs", async () => {
        mock.onPost(`/api/uacs/instrument/${instrumentName}`).reply(200);
        mock.onGet(`/api/uacs/instrument/${instrumentName}/bycaseid`).reply(200, uacCodes);
        mock.onGet(`/api/questionnaires/${instrumentName}/cases/ids`).reply(500);

        await expect(generateUACCodesAndCSVFileData(instrumentName))
            .rejects
            .toThrow("Failed to get questionnaire case IDs");
    });
});

describe("mapCasesToUACCodes(caseIDs: string[], uacCodes: InstrumentUacDetails)", () => {
    it("should return an list of matched cases", async () => {
        const caseIDs = ["0008", "0009"];
        const uacCodes: InstrumentUacDetails = {
            "0008": {
                case_id: "0008",
                instrument_name: "dst2106a",
                uac_chunks: {
                    uac1: "0008",
                    uac2: "4545",
                    uac3: "9373"
                }
            },
            "0009": {
                case_id: "0009",
                instrument_name: "dst2106a",
                uac_chunks: {
                    uac1: "0009",
                    uac2: "3454",
                    uac3: "4521"
                }
            },
        };

        const mergedCases = mapCasesToUACCodes(caseIDs, uacCodes);

        expect(mergedCases).toHaveLength(2);
        expect(mergedCases[0]).toEqual(expect.objectContaining(
            {
                "serial_number": "0008",
                "UAC1": "0008",
                "UAC2": "4545",
                "UAC3": "9373"
            }
        ));
    });

    it("should return an list of matched cases for 16 character uacs", async () => {
        const caseIDs = ["0008", "0009"];
        const uacCodes: InstrumentUacDetails = {
            "0008": {
                case_id: "0008",
                instrument_name: "dst2106a",
                uac_chunks: {
                    uac1: "0008",
                    uac2: "4545",
                    uac3: "9373",
                    uac4: "2313"
                }
            },
            "0009": {
                case_id: "0009",
                instrument_name: "dst2106a",
                uac_chunks: {
                    uac1: "0009",
                    uac2: "3454",
                    uac3: "4521",
                    uac4: "5312"
                }
            },
        };

        const mergedCases = mapCasesToUACCodes(caseIDs, uacCodes);

        expect(mergedCases).toHaveLength(2);
        expect(mergedCases[0]).toEqual(expect.objectContaining(
            {
                "serial_number": "0008",
                "UAC1": "0008",
                "UAC2": "4545",
                "UAC3": "9373",
                "UAC4": "2313"
            }
        ));
    });

    it("should throw an error if no cases match", async () => {
        const caseIDs = ["0001", "0002"];
        const uacCodes: InstrumentUacDetails = {
            "0008": {
                case_id: "0008",
                instrument_name: "dst2106a",
                uac_chunks: {
                    uac1: "0008",
                    uac2: "4545",
                    uac3: "9373"
                }
            },
            "0009": {
                case_id: "0009",
                instrument_name: "dst2106a",
                uac_chunks: {
                    uac1: "0009",
                    uac2: "3454",
                    uac3: "4521"
                }
            },
        };

        expect(() => {
            mapCasesToUACCodes(caseIDs, uacCodes);
        }).toThrow("Number of cases (2) does not match number of UAC Codes (0)");
    });

    it("should throw an error when length of case IDs does not match UAC array", async () => {
        const caseIDs = ["0001", "0002", "0003"];
        const uacCodes: InstrumentUacDetails = {
            "0008": {
                case_id: "0008",
                instrument_name: "dst2106a",
                uac_chunks: {
                    uac1: "0008",
                    uac2: "4545",
                    uac3: "9373"
                }
            },
            "0009": {
                case_id: "0009",
                instrument_name: "dst2106a",
                uac_chunks: {
                    uac1: "0009",
                    uac2: "3454",
                    uac3: "4521"
                }
            },
        };

        expect(() => {
            mapCasesToUACCodes(caseIDs, uacCodes);
        }).toThrow("Number of cases (3) does not match number of UAC Codes (0)");
    });

    it("should throw error when case IDs list and UAC codes are empty", async () => {
        const caseIDs: string[] = [];
        const uacCodes: InstrumentUacDetails = {};

        expect(() => {
            mapCasesToUACCodes(caseIDs, uacCodes);
        }).toThrow("No case IDs or UAC codes provided");
    });
});
