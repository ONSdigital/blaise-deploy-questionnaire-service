import axios from "axios";
import MockAdapter from "axios-mock-adapter";

import { sendClientLog } from "./clientLog";

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

function setAuthCookie(): void {
  document.cookie = "blaise-user-test-project=test-token; path=/";
}

function clearAuthCookie(): void {
  document.cookie = "blaise-user-test-project=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
}

describe("sendClientLog", () => {
  afterEach(() => {
    mock.reset();
    vi.unstubAllGlobals();
    clearAuthCookie();
  });

  it("skips sending logs when no auth token exists", async () => {
    await sendClientLog("info", "hello");

    expect(mock.history.post.length).toEqual(0);
  });

  it("posts a payload to /api/client-log", async () => {
    setAuthCookie();
    mock.onPost("/api/client-log").reply(204);

    await sendClientLog("info", "hello", { a: 1 });

    expect(mock.history.post.length).toEqual(1);
    const payload = JSON.parse(mock.history.post[0].data);

    expect(payload.level).toEqual("info");
    expect(payload.message).toEqual("hello");
    expect(payload.args).toEqual(['{"a":1}']);
    expect(payload.timestamp).toBeTruthy();
  });

  it("handles empty args and stringification edge cases", async () => {
    setAuthCookie();
    mock.onPost("/api/client-log").reply(204);

    await sendClientLog("info");
    const payload1 = JSON.parse(mock.history.post[0].data);

    expect(payload1.message).toEqual("");

    await sendClientLog("info", BigInt(1));
    const payload2 = JSON.parse(mock.history.post[1].data);

    expect(payload2.message).toEqual("1");

    const err = new Error("boom");

    const errorWithoutStack = err as Error & { stack?: string };

    errorWithoutStack.stack = undefined;
    await sendClientLog("info", err);
    const payload3 = JSON.parse(mock.history.post[2].data);

    expect(payload3.message).toContain("boom");
  });

  it("falls back for circular values and captures stack information from later error args", async () => {
    setAuthCookie();
    mock.onPost("/api/client-log").reply(204);

    const circular: { self?: unknown } = {};

    circular.self = circular;

    const err = new Error("secondary");

    await sendClientLog("error", circular, err);

    const payload = JSON.parse(mock.history.post[0].data);

    expect(payload.message).toEqual("[object Object]");
    expect(payload.args[0]).toContain("secondary");
    expect(payload.stack).toContain("secondary");
  });

  it("falls back to a generic error message and omits browser-only fields when globals are unavailable", async () => {
    setAuthCookie();
    mock.onPost("/api/client-log").reply(204);

    vi.stubGlobal("window", undefined);
    vi.stubGlobal("navigator", undefined);

    const errorWithoutMessage = new Error("");

    Object.defineProperty(errorWithoutMessage, "stack", {
      configurable: true,
      value: "",
    });

    await sendClientLog("error", errorWithoutMessage);

    const payload = JSON.parse(mock.history.post[0].data);

    expect(payload.message).toEqual("Error");
    expect(payload.pathname).toBeUndefined();
    expect(payload.href).toBeUndefined();
    expect(payload.userAgent).toBeUndefined();
  });
});
