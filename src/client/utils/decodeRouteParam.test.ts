import { decodeRouteParam } from "./decodeRouteParam";

describe("decodeRouteParam", () => {
  it("returns undefined when the route param is missing", () => {
    expect(decodeRouteParam(undefined)).toBeUndefined();
  });

  it("decodes URI encoded values", () => {
    expect(decodeRouteParam("IPS%20Manager")).toBe("IPS Manager");
  });

  it("falls back to the original value when decoding fails", () => {
    expect(decodeRouteParam("%E0%A4%A")).toBe("%E0%A4%A");
  });
});
