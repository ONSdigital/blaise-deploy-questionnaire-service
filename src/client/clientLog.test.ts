import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { sendClientLog } from "./clientLog";

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

describe("sendClientLog", () => {
    afterEach(() => {
        mock.reset();
    });

    it("posts a payload to /api/client-log", async () => {
        mock.onPost("/api/client-log").reply(204);

        await sendClientLog("info", "hello", { a: 1 });

        expect(mock.history.post.length).toEqual(1);
        const payload = JSON.parse(mock.history.post[0].data);
        expect(payload.level).toEqual("info");
        expect(payload.message).toEqual("hello");
        expect(payload.args).toEqual(["{\"a\":1}"]);
        expect(payload.timestamp).toBeTruthy();
    });

    it("handles empty args and stringification edge cases", async () => {
        mock.onPost("/api/client-log").reply(204);

        await sendClientLog("info");
        const payload1 = JSON.parse(mock.history.post[0].data);
        expect(payload1.message).toEqual("");

        // JSON.stringify(BigInt) throws; we should fall back to String(value)
        await sendClientLog("info", BigInt(1) as any);
        const payload2 = JSON.parse(mock.history.post[1].data);
        expect(payload2.message).toEqual("1");

        // Error with no stack should still stringify to message / fallback
        const err = new Error("boom");
        (err as any).stack = undefined;
        await sendClientLog("info", err);
        const payload3 = JSON.parse(mock.history.post[2].data);
        expect(payload3.message).toContain("boom");
    });
});
