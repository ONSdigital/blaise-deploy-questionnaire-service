import {
  GetInstrumentMode,
  InstrumentMode
} from "./instrument_mode";

describe("Function GetInstrumentMode()", () => {
  it("returns mixed when multiple modes are present", () => {
    expect(GetInstrumentMode(["CATI", "CAWI"])).toEqual(InstrumentMode.Mixed);
  });

  it("returns mixed when no modes are present", () => {
    expect(GetInstrumentMode([])).toEqual(InstrumentMode.Mixed);
  });

  it("returns mixed when only one mode is present and its not CATI", () => {
    expect(GetInstrumentMode(["CAWI"])).toEqual(InstrumentMode.Mixed);
  });

  it("returns cati when only one mode is present and it is CATI", () => {
    expect(GetInstrumentMode(["CATI"])).toEqual(InstrumentMode.Cati);
  });
});
