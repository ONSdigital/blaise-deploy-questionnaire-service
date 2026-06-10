import { beforeEach, describe, expect, it, vi } from "vitest";

import AuditLogger from "./auditLogger.js";

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
  dataMsg?: unknown;
  auditMessage?: unknown;
  infoAuditMessage?: unknown;
  infoMessage?: unknown;
  infoMsg?: unknown;
}) {
  return {
    metadata: {
      insertId: overrides.insertId ?? null,
      timestamp: overrides.timestamp ?? null,
      severity: overrides.severity ?? null,
    },
    data:
      overrides.dataMessage !== undefined ||
      overrides.dataMsg !== undefined ||
      overrides.auditMessage !== undefined ||
      overrides.infoAuditMessage !== undefined ||
      overrides.infoMessage !== undefined ||
      overrides.infoMsg !== undefined
        ? {
            message: overrides.dataMessage,
            msg: overrides.dataMsg,
            auditMessage: overrides.auditMessage,
            info: {
              auditMessage: overrides.infoAuditMessage,
              message: overrides.infoMessage,
              msg: overrides.infoMsg,
            },
          }
        : undefined,
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
    it("calls logger.info with structured AUDIT_LOG payload", () => {
      const logger = { info: vi.fn() };

      auditLogger.info(logger as never, "something happened");

      expect(logger.info).toHaveBeenCalledWith(
        { auditMessage: "something happened" },
        "AUDIT_LOG:",
      );
    });
  });

  describe("error", () => {
    it("calls logger.error with structured AUDIT_LOG payload", () => {
      const logger = { error: vi.fn() };

      auditLogger.error(logger as never, "something failed");

      expect(logger.error).toHaveBeenCalledWith({ auditMessage: "something failed" }, "AUDIT_LOG:");
    });

    it("sanitises newline characters in audit messages", () => {
      const logger = { error: vi.fn() };

      auditLogger.error(logger as never, "line one\nline two\r\nline three");

      expect(logger.error).toHaveBeenCalledWith(
        { auditMessage: "line one line two line three" },
        "AUDIT_LOG:",
      );
    });
  });

  describe("getLogs", () => {
    it("returns an empty array when there are no entries", async () => {
      mockGetEntries.mockResolvedValueOnce([[]]);
      const result = await auditLogger.getLogs();

      expect(result).toEqual([]);
    });

    it("maps a fully-populated auditMessage entry correctly", async () => {
      mockGetEntries.mockResolvedValueOnce([
        [
          makeEntry({
            insertId: "abc123",
            timestamp: new Date("2024-06-01T12:00:00Z"),
            severity: "ERROR",
            dataMessage: "AUDIT_LOG:",
            auditMessage: "user deleted a survey",
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
        [
          makeEntry({
            insertId: "id1",
            timestamp: "t",
            severity: "INFO",
            dataMessage: null,
            auditMessage: null,
          }),
        ],
      ]);
      const [entry] = await auditLogger.getLogs();

      expect(entry.message).toBe("");
    });

    it("uses empty string for message when data fields are not strings", async () => {
      mockGetEntries.mockResolvedValueOnce([
        [
          makeEntry({
            insertId: "id1",
            timestamp: "t",
            severity: "INFO",
            dataMessage: 42,
            auditMessage: 42,
          }),
        ],
      ]);
      const [entry] = await auditLogger.getLogs();

      expect(entry.message).toBe("");
    });

    it("strips the AUDIT_LOG prefix when reading legacy message field", async () => {
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

    it("reads auditMessage from nested info payload", async () => {
      mockGetEntries.mockResolvedValueOnce([
        [
          makeEntry({
            insertId: "id1",
            timestamp: "t",
            severity: "INFO",
            dataMessage: "AUDIT_LOG:",
            infoAuditMessage: "rich deleted questionnaire OPN2026A",
          }),
        ],
      ]);
      const [entry] = await auditLogger.getLogs();

      expect(entry.message).toBe("rich deleted questionnaire OPN2026A");
    });

    it("falls back to msg key when message key is absent", async () => {
      mockGetEntries.mockResolvedValueOnce([
        [
          makeEntry({
            insertId: "id1",
            timestamp: "t",
            severity: "INFO",
            dataMsg: "AUDIT_LOG: updated sample assignment",
          }),
        ],
      ]);
      const [entry] = await auditLogger.getLogs();

      expect(entry.message).toBe("updated sample assignment");
    });

    it("passes the correct filter and maxResults to getEntries", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-05-16T15:13:27.000Z"));
      mockGetEntries.mockResolvedValueOnce([[]]);

      await auditLogger.getLogs();

      expect(mockGetEntries).toHaveBeenCalledWith({
        filter:
          'resource.type="gae_app" AND resource.labels.module_id="dqs-ui" AND timestamp >= "2026-05-09T15:13:27.000Z" AND jsonPayload.message:"AUDIT_LOG:"',
        maxResults: 50,
      });

      vi.useRealTimers();
    });
  });
});
