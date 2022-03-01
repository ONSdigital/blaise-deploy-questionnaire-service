import { cleanup } from "@testing-library/react";
import { getAuditLogs } from "./auditLogs";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const mock = new MockAdapter(axios);

describe("Function getAuditLogs(filename: string) ", () => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });

    it("It should return true with data if the list is returned successfully", async () => {
        mock.onGet("/api/audit").reply(200, [{
            id: "test-id",
            timestamp: "test-timestamp",
            message: "test message",
            severity: "INFO"
        }]);
        const auditLogs = await getAuditLogs();

        expect(auditLogs).toEqual([{
            id: "test-id",
            timestamp: "test-timestamp",
            message: "test message",
            severity: "INFO"
        }]);
    });

    it("It should return false with an empty list if a 404 is returned from the server", async () => {
        mock.onGet("/api/audit").reply(404, []);

        await expect(getAuditLogs()).rejects.toThrow();
    });

    it("It should return false with an empty list if request returns an error code", async () => {
        mock.onGet("/api/audit").reply(500, []);

        await expect(getAuditLogs()).rejects.toThrow();
    });

    it("It should return false with an empty list if request call fails", async () => {
        mock.onGet("/api/audit").networkError();

        await expect(getAuditLogs()).rejects.toThrow();
    });
});
