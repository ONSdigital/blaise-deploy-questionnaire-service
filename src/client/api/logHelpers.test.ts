import { clientLogger } from "../utils/logger";

import { formatFunctionCall, logFunctionCall, logFunctionError } from "./logHelpers";

vi.mock("../utils/logger", () => ({
  clientLogger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("logHelpers", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("formats api function calls with primitive arguments", () => {
    expect(formatFunctionCall("fetchData", "abc", 1, true, null, undefined)).toBe(
      "fetchData(abc, 1, true, null, undefined)",
    );
  });

  it("logs api function calls", () => {
    logFunctionCall("getToStartDate", "OPN2004A");

    expect(clientLogger.info).toHaveBeenCalledWith("Call to getToStartDate(OPN2004A)");
  });

  it("logs api function failures", () => {
    logFunctionError("getToStartDate", new Error("boom"), "OPN2004A");

    expect(clientLogger.error).toHaveBeenCalledWith(
      "getToStartDate(OPN2004A) failed: Error: boom",
    );
  });
});