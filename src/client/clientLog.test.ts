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
});
