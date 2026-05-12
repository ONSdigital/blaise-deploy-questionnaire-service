import axios from "axios";
import MockAdapter from "axios-mock-adapter";

import { type InstrumentUacDetails } from "../uac.types";

import { generateUacsAndCsvFileData, mapCasesToUacs } from "./generateUacs";

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

describe("generateUacsAndCsvFileData(instrumentName: string)", () => {
  const instrumentName = "dst2106a";
  const caseIDs = ["0008", "0009"];
  const uacs: InstrumentUacDetails = {
    "0008": {
      case_id: "0008",
      instrument_name: "dst2106a",
      uac_chunks: {
        uac1: "0008",
        uac2: "4545",
        uac3: "9373",
      },
      full_uac: "000845459373",
    },
    "0009": {
      case_id: "0009",
      instrument_name: "dst2106a",
      uac_chunks: {
        uac1: "0009",
        uac2: "3454",
        uac3: "4521",
      },
      full_uac: "000934544521",
    },
  };

  afterEach(() => {
    mock.reset();
  });

  it("should return a list of matched cases", async () => {
    mock.onPost(`/api/uacs/instrument/${instrumentName}`).reply(200);
    mock.onGet(`/api/uacs/instrument/${instrumentName}/bycaseid`).reply(200, uacs);
    mock.onGet(`/api/questionnaires/${instrumentName}/cases/ids`).reply(200, caseIDs);

    const mergedCases = await generateUacsAndCsvFileData(instrumentName);

    expect(Object.keys(mergedCases).length).toEqual(2);
    expect(mergedCases).toEqual([
      { Uac1: "0008", Uac2: "4545", Uac3: "9373", Uac: "000845459373", serial_number: "0008" },
      { Uac1: "0009", Uac2: "3454", Uac3: "4521", Uac: "000934544521", serial_number: "0009" },
    ]);
  });

  it("should throw error when Uac generation fails", async () => {
    mock.onPost(`/api/uacs/instrument/${instrumentName}`).reply(500);
    mock.onGet(`/api/uacs/instrument/${instrumentName}/bycaseid`).reply(200, uacs);
    mock.onGet(`/api/questionnaires/${instrumentName}/cases/ids`).reply(200, caseIDs);

    await expect(generateUacsAndCsvFileData(instrumentName)).rejects.toThrow(
      "Failed to generate Uacs",
    );
  });

  it("should throw error when get Uacs fails", async () => {
    mock.onPost(`/api/uacs/instrument/${instrumentName}`).reply(200);
    mock.onGet(`/api/uacs/instrument/${instrumentName}/bycaseid`).reply(500);
    mock.onGet(`/api/questionnaires/${instrumentName}/cases/ids`).reply(200, caseIDs);

    await expect(generateUacsAndCsvFileData(instrumentName)).rejects.toThrow(
      "Failed to get Uacs by case ID",
    );
  });

  it("should throw error when get Case IDs", async () => {
    mock.onPost(`/api/uacs/instrument/${instrumentName}`).reply(200);
    mock.onGet(`/api/uacs/instrument/${instrumentName}/bycaseid`).reply(200, uacs);
    mock.onGet(`/api/questionnaires/${instrumentName}/cases/ids`).reply(500);

    await expect(generateUacsAndCsvFileData(instrumentName)).rejects.toThrow(
      "Failed to get questionnaire case IDs",
    );
  });
});

describe("mapCasesToUacs(caseIDs: string[], uacs: InstrumentUacDetails)", () => {
  it("should return an list of matched cases", async () => {
    const caseIDs = ["0008", "0009"];
    const uacs: InstrumentUacDetails = {
      "0008": {
        case_id: "0008",
        instrument_name: "dst2106a",
        uac_chunks: {
          uac1: "0008",
          uac2: "4545",
          uac3: "9373",
        },
      },
      "0009": {
        case_id: "0009",
        instrument_name: "dst2106a",
        uac_chunks: {
          uac1: "0009",
          uac2: "3454",
          uac3: "4521",
        },
      },
    };

    const mergedCases = mapCasesToUacs(caseIDs, uacs);

    expect(mergedCases).toHaveLength(2);
    expect(mergedCases[0]).toEqual(
      expect.objectContaining({
        serial_number: "0008",
        Uac1: "0008",
        Uac2: "4545",
        Uac3: "9373",
      }),
    );
  });

  it("should return an list of matched cases for 16 character uacs", async () => {
    const caseIDs = ["0008", "0009"];
    const uacs: InstrumentUacDetails = {
      "0008": {
        case_id: "0008",
        instrument_name: "dst2106a",
        uac_chunks: {
          uac1: "0008",
          uac2: "4545",
          uac3: "9373",
          uac4: "2313",
        },
      },
      "0009": {
        case_id: "0009",
        instrument_name: "dst2106a",
        uac_chunks: {
          uac1: "0009",
          uac2: "3454",
          uac3: "4521",
          uac4: "5312",
        },
      },
    };

    const mergedCases = mapCasesToUacs(caseIDs, uacs);

    expect(mergedCases).toHaveLength(2);
    expect(mergedCases[0]).toEqual(
      expect.objectContaining({
        serial_number: "0008",
        Uac1: "0008",
        Uac2: "4545",
        Uac3: "9373",
        Uac4: "2313",
      }),
    );
  });

  it("should throw an error if no cases match", async () => {
    const caseIDs = ["0001", "0002"];
    const uacs: InstrumentUacDetails = {
      "0008": {
        case_id: "0008",
        instrument_name: "dst2106a",
        uac_chunks: {
          uac1: "0008",
          uac2: "4545",
          uac3: "9373",
        },
      },
      "0009": {
        case_id: "0009",
        instrument_name: "dst2106a",
        uac_chunks: {
          uac1: "0009",
          uac2: "3454",
          uac3: "4521",
        },
      },
    };

    expect(() => {
      mapCasesToUacs(caseIDs, uacs);
    }).toThrow("Number of cases (2) does not match number of Uacs (0)");
  });

  it("should throw an error when length of case IDs does not match Uac array", async () => {
    const caseIDs = ["0001", "0002", "0003"];
    const uacs: InstrumentUacDetails = {
      "0008": {
        case_id: "0008",
        instrument_name: "dst2106a",
        uac_chunks: {
          uac1: "0008",
          uac2: "4545",
          uac3: "9373",
        },
      },
      "0009": {
        case_id: "0009",
        instrument_name: "dst2106a",
        uac_chunks: {
          uac1: "0009",
          uac2: "3454",
          uac3: "4521",
        },
      },
    };

    expect(() => {
      mapCasesToUacs(caseIDs, uacs);
    }).toThrow("Number of cases (3) does not match number of Uacs (0)");
  });

  it("should throw error when case IDs list and Uacs are empty", async () => {
    const caseIDs: string[] = [];
    const uacs: InstrumentUacDetails = {};

    expect(() => {
      mapCasesToUacs(caseIDs, uacs);
    }).toThrow("No case IDs or Uacs provided");
  });
});
