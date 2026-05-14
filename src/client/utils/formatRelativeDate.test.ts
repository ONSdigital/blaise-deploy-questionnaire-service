import { formatRelativeDate } from "./formatRelativeDate";

describe("formatRelativeDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-14T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the original value when the date cannot be parsed", () => {
    expect(formatRelativeDate("not-a-date")).toBe("not-a-date");
  });

  it("formats future dates", () => {
    expect(formatRelativeDate("2026-05-14T12:01:00Z")).toBe("in 1 minute");
  });

  it("formats past dates", () => {
    expect(formatRelativeDate("2026-05-12T12:00:00Z")).toBe("2 days ago");
  });

  it("formats the current time as now", () => {
    expect(formatRelativeDate(new Date("2026-05-14T12:00:00Z"))).toBe("now");
  });
});