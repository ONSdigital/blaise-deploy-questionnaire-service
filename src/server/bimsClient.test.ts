import { type IapProvider } from "blaise-iap-node-provider";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BimsClient } from "./bimsClient.js";

const {
  mockHttpGet,
  mockHttpPost,
  mockHttpDelete,
  mockHttpPatch,
  mockAxiosCreate,
  mockGetAuthHeader,
  mockIapProviderCtor,
} = vi.hoisted(() => {
  const hoistedMockHttpGet = vi.fn();
  const hoistedMockHttpPost = vi.fn();
  const hoistedMockHttpDelete = vi.fn();
  const hoistedMockHttpPatch = vi.fn();
  const hoistedMockAxiosCreate = vi.fn(() => ({
    get: hoistedMockHttpGet,
    post: hoistedMockHttpPost,
    delete: hoistedMockHttpDelete,
    patch: hoistedMockHttpPatch,
  }));
  const hoistedMockGetAuthHeader = vi.fn();
  const hoistedMockIapProviderCtor = vi.fn();

  return {
    mockHttpGet: hoistedMockHttpGet,
    mockHttpPost: hoistedMockHttpPost,
    mockHttpDelete: hoistedMockHttpDelete,
    mockHttpPatch: hoistedMockHttpPatch,
    mockAxiosCreate: hoistedMockAxiosCreate,
    mockGetAuthHeader: hoistedMockGetAuthHeader,
    mockIapProviderCtor: hoistedMockIapProviderCtor,
  };
});

vi.mock("axios", () => ({
  default: {
    create: mockAxiosCreate,
  },
  create: mockAxiosCreate,
}));

vi.mock("blaise-iap-node-provider", () => ({
  IapProvider: class MockIapProvider {
    constructor(clientId?: string) {
      mockIapProviderCtor(clientId);
    }

    getAuthHeader = mockGetAuthHeader;
  },
}));

describe("BimsClient", () => {
  let client: BimsClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthHeader.mockResolvedValue({ Authorization: "Bearer token" });
    client = new BimsClient("https://bims.example", "client-id");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("creates axios instance and IAP provider", () => {
      expect(mockAxiosCreate).toHaveBeenCalledTimes(1);
      expect(mockIapProviderCtor).toHaveBeenCalledWith("client-id");
    });
  });

  describe("getToStartDate", () => {
    it("returns Telephone Operations start date when API returns 200", async () => {
      mockHttpGet.mockResolvedValueOnce({ status: 200, data: { tostartdate: "2022-12-31" } });

      const result = await client.getToStartDate("OPN2004A");

      expect(result).toEqual({ tostartdate: "2022-12-31" });
      const [url, config] = mockHttpGet.mock.calls[0];

      expect(url).toBe("https://bims.example/tostartdate/OPN2004A");
      expect(config.headers).toEqual({ Authorization: "Bearer token" });
      expect(config.validateStatus(200)).toBe(true);
      expect(config.validateStatus(204)).toBe(true);
      expect(config.validateStatus(404)).toBe(true);
      expect(config.validateStatus(500)).toBe(false);
    });

    it("returns undefined when API returns 404", async () => {
      mockHttpGet.mockResolvedValueOnce({ status: 404, data: {} });

      await expect(client.getToStartDate("OPN2004A")).resolves.toBeUndefined();
    });

    it("returns undefined when API returns 204", async () => {
      mockHttpGet.mockResolvedValueOnce({ status: 204, data: {} });

      await expect(client.getToStartDate("OPN2004A")).resolves.toBeUndefined();
    });

    it("throws when API status is not expected", async () => {
      mockHttpGet.mockResolvedValueOnce({ status: 500, data: {} });

      await expect(client.getToStartDate("OPN2004A")).rejects.toThrow(
        "Error getting Telephone Operations start date for questionnaire: OPN2004A",
      );
    });
  });

  describe("deleteToStartDate", () => {
    it("succeeds when API returns 204", async () => {
      mockHttpDelete.mockResolvedValueOnce({ status: 204, data: {} });

      await expect(client.deleteToStartDate("OPN2004A")).resolves.toBeUndefined();
      expect(mockHttpDelete).toHaveBeenCalledWith("https://bims.example/tostartdate/OPN2004A", {
        headers: { Authorization: "Bearer token" },
      });
    });

    it("throws when API returns non-204", async () => {
      mockHttpDelete.mockResolvedValueOnce({ status: 200, data: {} });

      await expect(client.deleteToStartDate("OPN2004A")).rejects.toThrow(
        "Could not delete Telephone Operations start date for: OPN2004A",
      );
    });
  });

  describe("createToStartDate", () => {
    it("posts and returns created Telephone Operations start date", async () => {
      mockHttpPost.mockResolvedValueOnce({ status: 201, data: { tostartdate: "2022-12-31" } });

      const result = await client.createToStartDate("OPN2004A", "2022-12-31");

      expect(result).toEqual({ tostartdate: "2022-12-31" });
      expect(mockHttpPost).toHaveBeenCalledWith(
        "https://bims.example/tostartdate/OPN2004A",
        { tostartdate: "2022-12-31" },
        { headers: { Authorization: "Bearer token" } },
      );
    });
  });

  describe("updateToStartDate", () => {
    it("patches and returns updated Telephone Operations start date", async () => {
      mockHttpPatch.mockResolvedValueOnce({ status: 200, data: { tostartdate: "2022-12-31" } });

      const result = await client.updateToStartDate("OPN2004A", "2022-12-31");

      expect(result).toEqual({ tostartdate: "2022-12-31" });
      expect(mockHttpPatch).toHaveBeenCalledWith(
        "https://bims.example/tostartdate/OPN2004A",
        { tostartdate: "2022-12-31" },
        { headers: { Authorization: "Bearer token" } },
      );
    });
  });

  describe("getTmReleaseDate", () => {
    it("returns Totalmobile release date when API returns 200", async () => {
      mockHttpGet.mockResolvedValueOnce({ status: 200, data: { tmreleasedate: "2022-12-31" } });

      const result = await client.getTmReleaseDate("LMS2004A");

      expect(result).toEqual({ tmreleasedate: "2022-12-31" });
      expect(mockHttpGet).toHaveBeenCalledWith("https://bims.example/tmreleasedate/LMS2004A", {
        headers: { Authorization: "Bearer token" },
        validateStatus: expect.any(Function),
      });
    });

    it("returns undefined when API returns 404", async () => {
      mockHttpGet.mockResolvedValueOnce({ status: 404, data: {} });

      await expect(client.getTmReleaseDate("LMS2004A")).resolves.toBeUndefined();
    });

    it("returns undefined when API returns 204", async () => {
      mockHttpGet.mockResolvedValueOnce({ status: 204, data: {} });

      await expect(client.getTmReleaseDate("LMS2004A")).resolves.toBeUndefined();
    });

    it("throws when API status is not expected", async () => {
      mockHttpGet.mockResolvedValueOnce({ status: 500, data: {} });

      await expect(client.getTmReleaseDate("LMS2004A")).rejects.toThrow(
        "Error getting Totalmobile release date for questionnaire: LMS2004A",
      );
    });
  });

  describe("deleteTmReleaseDate", () => {
    it("succeeds when API returns 204", async () => {
      mockHttpDelete.mockResolvedValueOnce({ status: 204, data: {} });

      await expect(client.deleteTmReleaseDate("LMS2004A")).resolves.toBeUndefined();
      expect(mockHttpDelete).toHaveBeenCalledWith("https://bims.example/tmreleasedate/LMS2004A", {
        headers: { Authorization: "Bearer token" },
      });
    });

    it("throws when API returns non-204", async () => {
      mockHttpDelete.mockResolvedValueOnce({ status: 200, data: {} });

      await expect(client.deleteTmReleaseDate("LMS2004A")).rejects.toThrow(
        "Could not delete Totalmobile release date for: LMS2004A",
      );
    });
  });

  describe("createTmReleaseDate", () => {
    it("posts and returns created Totalmobile release date", async () => {
      mockHttpPost.mockResolvedValueOnce({ status: 201, data: { tmreleasedate: "2022-12-31" } });

      const result = await client.createTmReleaseDate("LMS2004A", "2022-12-31");

      expect(result).toEqual({ tmreleasedate: "2022-12-31" });
      expect(mockHttpPost).toHaveBeenCalledWith(
        "https://bims.example/tmreleasedate/LMS2004A",
        { tmreleasedate: "2022-12-31" },
        { headers: { Authorization: "Bearer token" } },
      );
    });
  });

  describe("updateTmReleaseDate", () => {
    it("patches and returns updated Totalmobile release date", async () => {
      mockHttpPatch.mockResolvedValueOnce({ status: 200, data: { tmreleasedate: "2022-12-31" } });

      const result = await client.updateTmReleaseDate("LMS2004A", "2022-12-31");

      expect(result).toEqual({ tmreleasedate: "2022-12-31" });
      expect(mockHttpPatch).toHaveBeenCalledWith(
        "https://bims.example/tmreleasedate/LMS2004A",
        { tmreleasedate: "2022-12-31" },
        { headers: { Authorization: "Bearer token" } },
      );
    });

    it("normalizes URLs without leading slash", async () => {
      const noAuthClient = new BimsClient("https://bims.example", "client-id");

      (noAuthClient as unknown as { authProvider: IapProvider | null }).authProvider = null;
      mockHttpPatch.mockResolvedValueOnce({ status: 200, data: {} });

      await (
        noAuthClient as unknown as {
          patch: (url: string, data?: unknown) => Promise<unknown>;
        }
      ).patch("tmreleasedate/LMS2004A", undefined);

      expect(mockHttpPatch).toHaveBeenCalledWith(
        "https://bims.example/tmreleasedate/LMS2004A",
        undefined,
        {},
      );
    });
  });
});
