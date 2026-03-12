import { clientLogger } from "./logger";
import { sendClientLog } from "./clientLog";

jest.mock("./clientLog", () => ({
    sendClientLog: jest.fn().mockResolvedValue(undefined),
}));

describe("clientLogger", () => {
    afterEach(() => {
        jest.clearAllMocks();
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
