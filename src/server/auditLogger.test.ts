import { type Logger } from "pino";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AuditLogger from "./auditLogger";

const mockGetEntries = vi.fn();
const mockLog = vi.fn().mockReturnValue({ getEntries: mockGetEntries });

vi.mock("@google-cloud/logging", () => ({
  Logging: class MockLogging {
    constructor(_options?: unknown) {}
    log = mockLog;
  },
}));

function makeEntry(overrides: {
  insertId?: string | null;
  timestamp?: unknown;
  severity?: unknown;
  dataMessage?: unknown;
}) {
  return {
    metadata: {
      insertId: overrides.insertId ?? null,
      timestamp: overrides.timestamp ?? null,
      severity: overrides.severity ?? null,
    },
    data: overrides.dataMessage !== undefined ? { message: overrides.dataMessage } : undefined,
  };
}

describe("AuditLogger", () => {
  let auditLogger: AuditLogger;

  beforeEach(() => {
    vi.clearAllMocks();
    auditLogger = new AuditLogger("test-project");
  });

  describe("constructor", () => {
    it("uses the projectId to build the logName passed to log()", async () => {
      mockGetEntries.mockResolvedValueOnce([[]]);
      await auditLogger.getLogs();
      expect(mockLog).toHaveBeenCalledWith("projects/test-project/logs/stdout");
    });
  });

  describe("info", () => {
    it("calls logger.info with AUDIT_LOG prefix", () => {
      const logger = { info: vi.fn() } as unknown as Logger;

      auditLogger.info(logger, "something happened");
      expect(logger.info).toHaveBeenCalledWith("AUDIT_LOG: something happened");
    });
  });

  describe("error", () => {
    it("calls logger.error with AUDIT_LOG prefix", () => {
      const logger = { error: vi.fn() } as unknown as Logger;

      auditLogger.error(logger, "something failed");
      expect(logger.error).toHaveBeenCalledWith("AUDIT_LOG: something failed");
    });
  });

  describe("getLogs", () => {
    it("returns an empty array when there are no entries", async () => {
      mockGetEntries.mockResolvedValueOnce([[]]);
      const result = await auditLogger.getLogs();

      expect(result).toEqual([]);
    });

    it("maps a fully-populated entry correctly", async () => {
      mockGetEntries.mockResolvedValueOnce([
        [
          makeEntry({
            insertId: "abc123",
            timestamp: new Date("2024-06-01T12:00:00Z"),
            severity: "ERROR",
            dataMessage: "AUDIT_LOG: user deleted a survey",
          }),
        ],
      ]);

      const result = await auditLogger.getLogs();

      expect(result).toEqual([
        {
          id: "abc123",
          timestamp: new Date("2024-06-01T12:00:00Z").toString(),
          severity: "ERROR",
          message: "user deleted a survey",
        },
      ]);
    });

    it("uses empty string for id when insertId is null", async () => {
      mockGetEntries.mockResolvedValueOnce([
        [
          makeEntry({
            insertId: null,
            timestamp: "2024-01-01",
            severity: "INFO",
            dataMessage: "AUDIT_LOG: x",
          }),
        ],
      ]);
      const [entry] = await auditLogger.getLogs();

      expect(entry.id).toBe("");
    });

    it("uses empty string for timestamp when metadata.timestamp is null", async () => {
      mockGetEntries.mockResolvedValueOnce([
        [
          makeEntry({
            insertId: "id1",
            timestamp: null,
            severity: "INFO",
            dataMessage: "AUDIT_LOG: x",
          }),
        ],
      ]);
      const [entry] = await auditLogger.getLogs();

      expect(entry.timestamp).toBe("");
    });

    it("defaults severity to INFO when metadata.severity is null", async () => {
      mockGetEntries.mockResolvedValueOnce([
        [
          makeEntry({
            insertId: "id1",
            timestamp: "t",
            severity: null,
            dataMessage: "AUDIT_LOG: x",
          }),
        ],
      ]);
      const [entry] = await auditLogger.getLogs();

      expect(entry.severity).toBe("INFO");
    });

    it("uses empty string for message when data is undefined", async () => {
      mockGetEntries.mockResolvedValueOnce([
        [makeEntry({ insertId: "id1", timestamp: "t", severity: "INFO" })],
      ]);
      const [entry] = await auditLogger.getLogs();

      expect(entry.message).toBe("");
    });

    it("uses empty string for message when data.message is null", async () => {
      mockGetEntries.mockResolvedValueOnce([
        [makeEntry({ insertId: "id1", timestamp: "t", severity: "INFO", dataMessage: null })],
      ]);
      const [entry] = await auditLogger.getLogs();

      expect(entry.message).toBe("");
    });

    it("uses empty string for message when data.message is not a string", async () => {
      mockGetEntries.mockResolvedValueOnce([
        [makeEntry({ insertId: "id1", timestamp: "t", severity: "INFO", dataMessage: 42 })],
      ]);
      const [entry] = await auditLogger.getLogs();

      expect(entry.message).toBe("");
    });

    it("strips the AUDIT_LOG prefix from the message", async () => {
      mockGetEntries.mockResolvedValueOnce([
        [
          makeEntry({
            insertId: "id1",
            timestamp: "t",
            severity: "INFO",
            dataMessage: "AUDIT_LOG: deployed OPN2101",
          }),
        ],
      ]);
      const [entry] = await auditLogger.getLogs();

      expect(entry.message).toBe("deployed OPN2101");
    });

    it("passes the correct filter and maxResults to getEntries", async () => {
      mockGetEntries.mockResolvedValueOnce([[]]);
      await auditLogger.getLogs();
      expect(mockGetEntries).toHaveBeenCalledWith({
        filter:
          'resource.type="gae_app" AND resource.labels.module_id="dqs-ui" AND jsonPayload.message=~"^AUDIT_LOG: "',
        maxResults: 50,
      });
    });
  });
});
