import { sendClientLog } from "./clientLog";
import { clientLogger } from "./logger";

vi.mock("./clientLog", () => ({
  sendClientLog: vi.fn().mockResolvedValue(undefined),
}));

describe("clientLogger", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("forwards debug logs", () => {
    clientLogger.debug("a", 1);
    expect(sendClientLog).toHaveBeenCalledWith("debug", "a", 1);
  });

  it("forwards warn logs", () => {
    clientLogger.warn("warn", { x: 1 });
    expect(sendClientLog).toHaveBeenCalledWith("warn", "warn", { x: 1 });
  });
});
