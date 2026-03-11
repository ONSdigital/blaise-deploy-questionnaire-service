import { newServer } from "../server";
import supertest, { Response } from "supertest";

import { Auth } from "blaise-login-react/blaise-login-react-server";
import { getConfigFromEnv } from "../config";
import createLogger, { HttpLogger } from "pino-http";
import pino from "pino";

jest.mock("blaise-login-react/blaise-login-react-server", () => {
    const loginReact = jest.requireActual("blaise-login-react/blaise-login-react-server");
    return {
        ...loginReact,
    };
});

Auth.prototype.ValidateToken = jest.fn().mockReturnValue(true);
Auth.prototype.GetUser = jest.fn().mockReturnValue({ name: "rich" });
Auth.prototype.GetToken = jest.fn().mockReturnValue("example-token");

jest.mock("blaise-iap-node-provider");

const logger: pino.Logger = pino();
logger.child = jest.fn(() => logger); // pino-http uses child logger
const logInfo = jest.spyOn(logger, "info");
const logWarn = jest.spyOn(logger, "warn");
const logError = jest.spyOn(logger, "error");
const httpLogger: HttpLogger = createLogger({ logger: logger, autoLogging: false });

const config = getConfigFromEnv();
const request = supertest(newServer(config, httpLogger));

describe("Client log forwarding", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it("accepts an info client log and writes it to server logs", async () => {
        const response: Response = await request
            .post("/api/client-log")
            .send({ level: "info", message: "hello from browser", args: ["extra"], pathname: "/audit" });

        expect(response.status).toEqual(204);
        expect(logInfo).toHaveBeenCalled();
        const lastCall = logInfo.mock.calls[logInfo.mock.calls.length - 1];
        expect(lastCall[1]).toEqual("CLIENT_LOG: hello from browser");
        expect(lastCall[0]).toHaveProperty("clientLog");
    });

    it("accepts warn/error levels and routes to the correct pino method", async () => {
        const warnRes: Response = await request
            .post("/api/client-log")
            .send({ level: "warn", message: "a warning" });
        expect(warnRes.status).toEqual(204);
        expect(logWarn).toHaveBeenCalled();

        const errRes: Response = await request
            .post("/api/client-log")
            .send({ level: "error", message: "an error" });
        expect(errRes.status).toEqual(204);
        expect(logError).toHaveBeenCalled();
    });

    it("rejects an invalid level", async () => {
        const response: Response = await request
            .post("/api/client-log")
            .send({ level: "verbose", message: "nope" });

        expect(response.status).toEqual(400);
        expect(logInfo).not.toHaveBeenCalled();
        expect(logWarn).not.toHaveBeenCalled();
        expect(logError).not.toHaveBeenCalled();
    });
});
