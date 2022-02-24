import { cleanup } from "@testing-library/react";
import { getAllInstrumentsInBucket, validateUploadIsComplete } from "./upload";

import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const mock = new MockAdapter(axios);

describe("Function validateUploadIsComplete(filename: string) ", () => {
    it("should return true if object with the correct filename returned", async () => {
        mock.onGet("/upload/verify?filename=OPN2004A.bpkg").reply(200, { name: "OPN2004A.bpkg" });

        const fileFound = await validateUploadIsComplete("OPN2004A.bpkg");
        expect(fileFound).toBeTruthy();
    });

    it("should return false if object is returned with different filename", async () => {
        mock.onGet("/upload/verify?filename=OPN2004A.bpkg").reply(200, { name: "RandonName.bpkg" });

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

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });
});

describe("Function getAllInstrumentsInBucket() ", () => {
    const instrumentsInBucket: string[] = ["OPN2101A.bpkg", "OPN2004A.bpkg", "LMS2101_BK2.bpkg"];

    it("should return true if the list is returned successfully", async () => {
        mock.onGet("/bucket/files").reply(200, instrumentsInBucket);

        const instruments = await getAllInstrumentsInBucket();
        expect(instruments).toEqual(instruments);
    });

    it("should throw an error if a 404 is returned from the server", async () => {
        mock.onGet("/bucket/files").reply(404, []);

        await expect(getAllInstrumentsInBucket()).rejects.toThrow();
    });

    it("should return false with an empty list if request returns an error code", async () => {
        mock.onGet("/bucket/files").reply(500, []);

        await expect(getAllInstrumentsInBucket()).rejects.toThrow();
    });

    it("should return false with an empty list if request call fails", async () => {
        mock.onGet("/bucket/files").networkError();

        await expect(getAllInstrumentsInBucket()).rejects.toThrow();
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });
});
