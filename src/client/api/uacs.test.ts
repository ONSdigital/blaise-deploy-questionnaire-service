import axios from "axios";
import MockAdapter from "axios-mock-adapter";

import { generateUacs, getUacCount, getUacsByCaseId } from "./uacs";

const mock = new MockAdapter(axios);

describe("Function getUacCount(questionnaireName: string) ", () => {
  const questionnaireName = "OPN2004A";

  afterEach(() => {
    mock.reset();
  });

  it("should return the count as type number", async () => {
    mock.onGet(`/api/uacs/instrument/${questionnaireName}/count`).reply(200, { count: 100 });

    const count = await getUacCount(questionnaireName);

    expect(count).toEqual(100);
  });

  it("should throw an error if object is returned with count not of type number", async () => {
    mock.onGet(`/api/uacs/instrument/${questionnaireName}/count`).reply(200, { count: "100" });

    await expect(getUacCount(questionnaireName)).rejects.toThrow("Uac count was not a number");
  });

  it("should throw an error if request returns an error code", async () => {
    mock.onGet(`/api/uacs/instrument/${questionnaireName}/count`).reply(500);

    await expect(getUacCount(questionnaireName)).rejects.toThrow();
  });

  it("should throw an error if request call fails", async () => {
    mock.onGet(`/api/uacs/instrument/${questionnaireName}/count`).networkError();

    await expect(getUacCount(questionnaireName)).rejects.toThrow();
  });
});

describe("Function generateUacs(questionnaireName: string) ", () => {
  const questionnaireName = "OPN2004A";

  afterEach(() => {
    mock.reset();
  });

  it("should return true if a status 200 is returned", async () => {
    mock.onPost(`/api/uacs/instrument/${questionnaireName}`).reply(200);

    const success = await generateUacs(questionnaireName);

    expect(success).toBeTruthy();
  });

  it("should return false if request returns an error code", async () => {
    mock.onPost(`/api/uacs/instrument/${questionnaireName}`).reply(500);

    const success = await generateUacs(questionnaireName);

    expect(success).toBeFalsy();
  });

  it("should return false if request call fails", async () => {
    mock.onPost(`/api/uacs/instrument/${questionnaireName}/count`).networkError();

    const success = await generateUacs(questionnaireName);

    expect(success).toBeFalsy();
  });
});

describe("Function getUacsByCaseId(questionnaireName: string)", () => {
  const questionnaireName = "OPN2004A";

  afterEach(() => {
    mock.reset();
  });

  it("should return true if a status 200 is returned", async () => {
    mock.onGet(`/api/uacs/instrument/${questionnaireName}/bycaseid`).reply(200, {
      case1: {
        instrument_name: questionnaireName,
        case_id: "case1",
        uac_chunks: { uac1: "1234", uac2: "2345", uac3: "3456" },
      },
    });

    const uacsByCaseId = await getUacsByCaseId(questionnaireName);

    expect(uacsByCaseId).toEqual({
      case1: {
        instrument_name: questionnaireName,
        case_id: "case1",
        uac_chunks: { uac1: "1234", uac2: "2345", uac3: "3456" },
      },
    });
  });

  it("should throw an error if request returns an error code", async () => {
    mock.onGet(`/api/uacs/instrument/${questionnaireName}/bycaseid`).reply(500);

    await expect(getUacsByCaseId(questionnaireName)).rejects.toThrow();
  });

  it("should throw an error if request call fails", async () => {
    mock.onGet(`/api/uacs/instrument/${questionnaireName}/bycaseid`).networkError();

    await expect(getUacsByCaseId(questionnaireName)).rejects.toThrow();
  });
});
