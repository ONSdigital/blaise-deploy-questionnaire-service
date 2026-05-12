import { type GetSignedUrlConfig } from "@google-cloud/storage";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type Config } from "./config.js";
import StorageManager from "./storageManager.js";

const mockGetSignedUrl = vi.fn();
const mockGetMetadata = vi.fn();
const mockGetFiles = vi.fn();
const mockFile = vi.fn();
const mockBucket = vi.fn();

vi.mock("@google-cloud/storage", () => ({
  Storage: class MockStorage {
    constructor(_options?: unknown) {}

    public bucket(bucketName: string) {
      mockBucket(bucketName);

      return {
        file: (fileName: string) => {
          mockFile(fileName);

          return {
            getSignedUrl: mockGetSignedUrl,
            getMetadata: mockGetMetadata,
          };
        },
        getFiles: mockGetFiles,
      };
    }
  },
}));

const mockConfig: Config = {
  BucketName: "test-bucket",
  ProjectId: "test-project",
  BlaiseApiUrl: "http://blaise",
  ServerPark: "gusty",
  BimsApiUrl: "http://bims",
  BimsClientId: "bims-client",
  BusApiUrl: "http://bus",
  BusClientId: "bus-client",
  CreateDonorCasesCloudFunctionUrl: "http://create",
  ReissueNewDonorCaseCloudFunctionUrl: "http://reissue",
  GetUsersByRoleCloudFunctionUrl: "http://users",
  SessionTimeout: "12h",
  SessionSecret: "secret",
  Roles: ["DST"],
  Port: 5000,
} as unknown as Config;

describe("StorageManager", () => {
  let storageManager: StorageManager;

  beforeEach(() => {
    vi.clearAllMocks();
    storageManager = new StorageManager(mockConfig);
  });

  describe("constructor", () => {
    it("sets bucketName from config", () => {
      expect(storageManager.bucketName).toBe("test-bucket");
    });

    it("initialises bucket with the configured bucket name", () => {
      expect(mockBucket).toHaveBeenCalledWith("test-bucket");
    });
  });

  describe("GetSignedUrl", () => {
    it("returns the signed URL on success", async () => {
      mockGetSignedUrl.mockResolvedValueOnce(["https://signed-url"]);

      const url = await storageManager.GetSignedUrl("file.bpkg");

      expect(url).toBe("https://signed-url");
    });

    it("calls getSignedUrl with correct options", async () => {
      mockGetSignedUrl.mockResolvedValueOnce(["https://signed-url"]);

      await storageManager.GetSignedUrl("file.bpkg");

      expect(mockFile).toHaveBeenCalledWith("file.bpkg");
      const [options] = mockGetSignedUrl.mock.calls[0] as [GetSignedUrlConfig];

      expect(options.version).toBe("v4");
      expect(options.action).toBe("write");
      expect(options.contentType).toBe("application/octet-stream");
      expect(typeof options.expires).toBe("number");
    });

    it("throws a wrapped error when getSignedUrl fails", async () => {
      const cause = new Error("network error");

      mockGetSignedUrl.mockRejectedValueOnce(cause);

      await expect(storageManager.GetSignedUrl("file.bpkg")).rejects.toThrow("getSignedUrl Failed");
    });
  });

  describe("GetBucketItems", () => {
    it("returns only .bpkg file names", async () => {
      mockGetFiles.mockResolvedValueOnce([
        [{ name: "survey.bpkg" }, { name: "readme.txt" }, { name: "data.bpkg" }],
      ]);

      const items = await storageManager.GetBucketItems();

      expect(items).toEqual(["survey.bpkg", "data.bpkg"]);
    });

    it("returns empty array when bucket is empty", async () => {
      mockGetFiles.mockResolvedValueOnce([[]]);

      const items = await storageManager.GetBucketItems();

      expect(items).toEqual([]);
    });

    it("returns empty array when no .bpkg files exist", async () => {
      mockGetFiles.mockResolvedValueOnce([[{ name: "notes.txt" }]]);

      const items = await storageManager.GetBucketItems();

      expect(items).toEqual([]);
    });

    it("throws a wrapped error when getFiles fails", async () => {
      const cause = new Error("bucket error");

      mockGetFiles.mockRejectedValueOnce(cause);

      await expect(storageManager.GetBucketItems()).rejects.toThrow("getBucketItems Failed");
    });
  });

  describe("CheckFile", () => {
    it("returns file metadata when file exists", async () => {
      mockGetMetadata.mockResolvedValueOnce([
        { name: "survey.bpkg", updated: "2024-01-01T00:00:00Z" },
      ]);

      const result = await storageManager.CheckFile("survey.bpkg");

      expect(result).toEqual({ name: "survey.bpkg", updated: "2024-01-01T00:00:00Z", found: true });
    });

    it("returns found: false when file does not exist (404)", async () => {
      mockGetMetadata.mockRejectedValueOnce({ code: 404 });

      const result = await storageManager.CheckFile("missing.bpkg");

      expect(result).toEqual({ found: false });
    });

    it("throws a wrapped error for non-404 errors", async () => {
      mockGetMetadata.mockRejectedValueOnce(new Error("permission denied"));

      await expect(storageManager.CheckFile("survey.bpkg")).rejects.toThrow("checkFile Failed");
    });

    it("throws a wrapped error when error is not an object", async () => {
      mockGetMetadata.mockRejectedValueOnce("string error");

      await expect(storageManager.CheckFile("survey.bpkg")).rejects.toThrow("checkFile Failed");
    });

    it("throws a wrapped error when error object has no code property", async () => {
      mockGetMetadata.mockRejectedValueOnce({ message: "unknown" });

      await expect(storageManager.CheckFile("survey.bpkg")).rejects.toThrow("checkFile Failed");
    });

    it("throws a wrapped error when error code is not 404", async () => {
      mockGetMetadata.mockRejectedValueOnce({ code: 500 });

      await expect(storageManager.CheckFile("survey.bpkg")).rejects.toThrow("checkFile Failed");
    });
  });
});
