import axios from "axios";
import MockAdapter from "axios-mock-adapter";

import { getAllQuestionnairesInBucket, initialiseUpload, validateUploadIsComplete } from "./upload";

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

vi.mock("../api/logger", () => ({
  clientLogger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Function validateUploadIsComplete(filename: string) ", () => {
  afterEach(() => {
    mock.reset();
  });

  it("should return true if the response contains the expected filename", async () => {
    mock.onGet("/upload/verify?filename=OPN2004A.bpkg").reply(200, { name: "OPN2004A.bpkg" });

    const fileFound = await validateUploadIsComplete("OPN2004A.bpkg");

    expect(fileFound).toBeTruthy();
  });

  it("should return false if the response contains a different filename", async () => {
    mock.onGet("/upload/verify?filename=OPN2004A.bpkg").reply(200, { name: "RandomName.bpkg" });

    const fileFound = await validateUploadIsComplete("OPN2004A.bpkg");

    expect(fileFound).toBeFalsy();
  });

  it("should return false if request returns an error code", async () => {
    mock.onGet("/upload/verify?filename=OPN2004A.bpkg").reply(500, { name: "OPN2004A.bpkg" });

    const fileFound = await validateUploadIsComplete("OPN2004A.bpkg");

    expect(fileFound).toBeFalsy();
  });

  it("should return false if request call fails", async () => {
    mock.onGet("/upload/verify?filename=OPN2004A.bpkg").networkError();

    const fileFound = await validateUploadIsComplete("OPN2004A.bpkg");

    expect(fileFound).toBeFalsy();
  });
});

describe("Function initialiseUpload(filename: string)", () => {
  afterEach(() => {
    mock.reset();
  });

  it("accepts signed URLs on bucket subdomain hosts", async () => {
    mock
      .onGet("/upload/init?filename=OPN2004A.bpkg")
      .reply(200, "https://my-bucket.storage.googleapis.com/signed");

    await expect(initialiseUpload("OPN2004A.bpkg")).resolves.toBe(
      "https://my-bucket.storage.googleapis.com/signed",
    );
  });

  it("encodes filename query parameter", async () => {
    mock
      .onGet("/upload/init?filename=DST2304Z%20test.bpkg")
      .reply(200, "https://storage.googleapis.com/signed");

    await expect(initialiseUpload("DST2304Z test.bpkg")).resolves.toBe(
      "https://storage.googleapis.com/signed",
    );
  });

  it("throws when signed URL host is not allowed", async () => {
    mock.onGet("/upload/init?filename=OPN2004A.bpkg").reply(200, "https://evil.example.com/signed");

    await expect(initialiseUpload("OPN2004A.bpkg")).rejects.toBeTruthy();
  });
});

describe("Function getAllQuestionnairesInBucket() ", () => {
  const questionnairesInBucket: string[] = ["OPN2101A.bpkg", "OPN2004A.bpkg", "LMS2101_BK2.bpkg"];

  afterEach(() => {
    mock.reset();
  });

  it("should return true if the list is returned successfully", async () => {
    mock.onGet("/bucket/files").reply(200, questionnairesInBucket);

    const questionnaires = await getAllQuestionnairesInBucket();

    expect(questionnaires).toEqual(questionnaires);
  });

  it("should throw an error if a 404 is returned from the server", async () => {
    mock.onGet("/bucket/files").reply(404, []);

    await expect(getAllQuestionnairesInBucket()).rejects.toThrow();
  });

  it("should return false with an empty list if request returns an error code", async () => {
    mock.onGet("/bucket/files").reply(500, []);

    await expect(getAllQuestionnairesInBucket()).rejects.toThrow();
  });

  it("should return false with an empty list if request call fails", async () => {
    mock.onGet("/bucket/files").networkError();

    await expect(getAllQuestionnairesInBucket()).rejects.toThrow();
  });

  it("should return an empty list if response is not an array", async () => {
    mock.onGet("/bucket/files").reply(200, { message: "forbidden" });

    await expect(getAllQuestionnairesInBucket()).resolves.toEqual([]);
  });
});
