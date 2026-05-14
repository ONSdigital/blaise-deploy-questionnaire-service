import axios from "axios";

import { clientLogger } from "../utils/logger";

import { formatFunctionCall, logFunctionCall, logFunctionError } from "./logHelpers";
import axiosConfig from "./axiosConfig";
import { createDateClient } from "./dateClient";

vi.mock("axios");

vi.mock("./axiosConfig", () => ({
  default: vi.fn(() => ({ headers: { Authorization: "Bearer test-token" } })),
}));

vi.mock("../utils/logger", () => ({
  clientLogger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("./logHelpers", () => ({
  formatFunctionCall: vi.fn((functionName: string, ...args: unknown[]) => {
    return `${functionName}(${args.join(", ")})`;
  }),
  logFunctionCall: vi.fn(),
  logFunctionError: vi.fn(),
}));

describe("createDateClient", () => {
  const client = createDateClient({
    apiPath: "tostartdate",
    fieldKey: "tostartdate",
    logLabel: "ToStartDate",
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it.each([200, 201])("returns true when set succeeds with status %i", async (status) => {
    vi.mocked(axios.post).mockResolvedValue({ status } as never);

    await expect(client.set("OPN2004A", "2026-05-14")).resolves.toBe(true);
    expect(logFunctionCall).toHaveBeenCalledWith("setToStartDate", "OPN2004A", "2026-05-14");
    expect(axios.post).toHaveBeenCalledWith(
      "/api/tostartdate/OPN2004A",
      { tostartdate: "2026-05-14" },
      { headers: { Authorization: "Bearer test-token" } },
    );
    expect(axiosConfig).toHaveBeenCalled();
  });

  it("returns false when set fails", async () => {
    const error = new Error("boom");
    vi.mocked(axios.post).mockRejectedValue(error);

    await expect(client.set("OPN2004A", undefined)).resolves.toBe(false);
    expect(logFunctionError).toHaveBeenCalledWith(
      "setToStartDate",
      error,
      "OPN2004A",
      undefined,
    );
  });

  it("returns parsed values from get", async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: { tostartdate: "2026-05-14" } } as never);

    await expect(client.get("OPN2004A")).resolves.toBe("2026-05-14");
    expect(logFunctionCall).toHaveBeenCalledWith("getToStartDate", "OPN2004A");
  });

  it("returns an empty string and logs when get finds no usable value", async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: { tostartdate: 123 } } as never);

    await expect(client.get("OPN2004A")).resolves.toBe("");
    expect(formatFunctionCall).toHaveBeenCalledWith("getToStartDate", "OPN2004A");
    expect(clientLogger.info).toHaveBeenCalledWith("getToStartDate(OPN2004A) returned no value");
  });

  it("returns an empty string for configured not found responses", async () => {
    vi.mocked(axios.get).mockRejectedValue({ isAxiosError: true, response: { status: 404 } });

    await expect(client.get("OPN2004A")).resolves.toBe("");
    expect(clientLogger.info).toHaveBeenCalledWith("getToStartDate(OPN2004A) returned no value");
  });

  it("rethrows primitive get errors", async () => {
    vi.mocked(axios.get).mockRejectedValue("explode");

    await expect(client.get("OPN2004A")).rejects.toBe("explode");
    expect(logFunctionError).toHaveBeenCalledWith("getToStartDate", "explode", "OPN2004A");
  });

  it("rethrows axios errors without a response status", async () => {
    const error = { isAxiosError: true, response: {} };
    vi.mocked(axios.get).mockRejectedValue(error);

    await expect(client.get("OPN2004A")).rejects.toBe(error);
    expect(logFunctionError).toHaveBeenCalledWith("getToStartDate", error, "OPN2004A");
  });

  it("rethrows unexpected get errors", async () => {
    const error = new Error("explode");
    vi.mocked(axios.get).mockRejectedValue(error);

    await expect(client.get("OPN2004A")).rejects.toBe(error);
    expect(logFunctionError).toHaveBeenCalledWith("getToStartDate", error, "OPN2004A");
  });

  it("supports a custom response parser", async () => {
    const customClient = createDateClient({
      apiPath: "tmreleasedate",
      fieldKey: "tmreleasedate",
      logLabel: "TmReleaseDate",
      parseResponseData: (data) => (typeof data === "string" ? data.toUpperCase() : ""),
    });

    vi.mocked(axios.get).mockResolvedValue({ data: "2026-05-15" } as never);

    await expect(customClient.get("LMS2004A")).resolves.toBe("2026-05-15");
  });

  it("returns true when delete succeeds with status 204", async () => {
    vi.mocked(axios.delete).mockResolvedValue({ status: 204 } as never);

    await expect(client.delete("OPN2004A")).resolves.toBe(true);
    expect(logFunctionCall).toHaveBeenCalledWith("deleteToStartDate", "OPN2004A");
  });

  it("returns false when delete succeeds with a non-204 status", async () => {
    vi.mocked(axios.delete).mockResolvedValue({ status: 200 } as never);

    await expect(client.delete("OPN2004A")).resolves.toBe(false);
  });

  it("returns false when delete fails", async () => {
    const error = new Error("boom");
    vi.mocked(axios.delete).mockRejectedValue(error);

    await expect(client.delete("OPN2004A")).resolves.toBe(false);
    expect(logFunctionError).toHaveBeenCalledWith("deleteToStartDate", error, "OPN2004A");
  });
});