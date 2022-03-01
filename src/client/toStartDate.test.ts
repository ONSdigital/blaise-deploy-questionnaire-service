import { cleanup } from "@testing-library/react";
import { deleteTOStartDate, getTOStartDate, setTOStartDate } from "./toStartDate";

import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const mock = new MockAdapter(axios);

describe("Function setTOStartDate(instrumentName: string, toStartDate: string) ", () => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });

    it("should return true if created 201 response is returned", async () => {
        mock.onPost("/api/tostartdate/OPN2004A").reply(201);

        const success = await setTOStartDate("OPN2004A", "2020-01-01");
        expect(success).toBeTruthy();
    });

    it("should return false if a 404 is returned from the server", async () => {
        mock.onPost("/api/tostartdate/OPN2004A").reply(404);

        const success = await setTOStartDate("OPN2004A", "2020-01-01");
        expect(success).toBeFalsy();
    });

    it("should return false if request returns an error code", async () => {
        mock.onPost("/api/tostartdate/OPN2004A").reply(500);

        const success = await setTOStartDate("OPN2004A", "2020-01-01");
        expect(success).toEqual(false);
    });

    it("should return false object if request call fails", async () => {
        mock.onPost("/api/tostartdate/OPN2004A").networkError();

        const success = await setTOStartDate("OPN2004A", "2020-01-01");
        expect(success).toEqual(false);
    });
});

describe("Function getTOStartDate(instrumentName: string) ", () => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });

    it("should return true and a TO start date string if object with the correct name returned", async () => {
        mock.onGet("/api/tostartdate/OPN2004A").reply(200, { "tostartdate": "1997-12-24" });

        const toStartDate = await getTOStartDate("OPN2004A");
        expect(toStartDate).toEqual("1997-12-24");
    });

    it("should throw an error if object with without a To start date is returned", async () => {
        mock.onGet("/api/tostartdate/OPN2004A").reply(200, { name: "BACON" });

        await expect(getTOStartDate("OPN2004A")).rejects.toThrow("No tostartdate in response");
    });

    it("should throw an error if a 404 is returned from the server", async () => {
        mock.onGet("/api/tostartdate/OPN2004A").reply(404);

        const toStartDate = await getTOStartDate("OPN2004A");
        expect(toStartDate).toEqual("");
    });

    it("should throw an error if request returns an error code", async () => {
        mock.onGet("/api/tostartdate/OPN2004A").reply(500);

        await expect(getTOStartDate("OPN2004A")).rejects.toThrow();
    });

    it("should throw an error if request call fails", async () => {
        mock.onGet("/api/tostartdate/OPN2004A").networkError();

        await expect(getTOStartDate("OPN2004A")).rejects.toThrow();
    });
});

describe("Function deleteTOStartDate(instrumentName: string, toStartDate: string) ", () => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });

    it("should return true if created 204 response is returned", async () => {
        mock.onDelete("/api/tostartdate/OPN2004A").reply(204);

        const success = await deleteTOStartDate("OPN2004A");
        expect(success).toBeTruthy();
    });

    it("should return false if a 404 is returned from the server", async () => {
        mock.onDelete("/api/tostartdate/OPN2004A").reply(404);

        const success = await deleteTOStartDate("OPN2004A");
        expect(success).toBeFalsy();
    });

    it("should return false if request returns an error code", async () => {
        mock.onDelete("/api/tostartdate/OPN2004A").reply(500);

        const success = await deleteTOStartDate("OPN2004A");
        expect(success).toEqual(false);
    });

    it("should return false object if request call fails", async () => {
        mock.onDelete("/api/tostartdate/OPN2004A").networkError();

        const success = await deleteTOStartDate("OPN2004A");
        expect(success).toEqual(false);
    });
});
