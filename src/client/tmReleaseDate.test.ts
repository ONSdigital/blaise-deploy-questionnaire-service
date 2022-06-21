import { deleteTMReleaseDate, getTMReleaseDate, setTMReleaseDate } from "./tmReleaseDate";

import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const mock = new MockAdapter(axios);

describe("Function setTMReleaseDate(questionnaireName: string, tmReleaseDate: string) ", () => {
    afterEach(() => {
        mock.reset();
    });

    it("should return true if created 201 response is returned", async () => {
        mock.onPost("/api/tmreleasedate/LMS2004A").reply(201);

        const success = await setTMReleaseDate("LMS2004A", "2020-01-01");
        expect(success).toBeTruthy();
    });

    it("should return false if a 404 is returned from the server", async () => {
        mock.onPost("/api/tmreleasedate/LMS2004A").reply(404);

        const success = await setTMReleaseDate("LMS2004A", "2020-01-01");
        expect(success).toBeFalsy();
    });

    it("should return false if request returns an error code", async () => {
        mock.onPost("/api/tmreleasedate/LMS2004A").reply(500);

        const success = await setTMReleaseDate("LMS2004A", "2020-01-01");
        expect(success).toEqual(false);
    });

    it("should return false object if request call fails", async () => {
        mock.onPost("/api/tmreleasedate/LMS2004A").networkError();

        const success = await setTMReleaseDate("LMS2004A", "2020-01-01");
        expect(success).toEqual(false);
    });
});

describe("Function getTMReleaseDate(questionnaireName: string) ", () => {
    afterEach(() => {
        mock.reset();
    });

    it("should return true and a TM release date string if object with the correct name returned", async () => {
        mock.onGet("/api/tmreleasedate/LMS2004A").reply(200, { "tmreleasedate": "1997-12-24" });

        const tmReleaseDate = await getTMReleaseDate("LMS2004A");
        expect(tmReleaseDate).toEqual("1997-12-24");
    });

    it("should throw an error if object with without a TM release date is returned", async () => {
        mock.onGet("/api/tmreleasedate/LMS2004A").reply(200, { name: "BACON" });

        await expect(getTMReleaseDate("LMS2004A")).rejects.toThrow("No tmreleasedate in response");
    });

    it("should throw an error if a 404 is returned from the server", async () => {
        mock.onGet("/api/tmreleasedate/LMS2004A").reply(404);

        const tmReleaseDate = await getTMReleaseDate("LMS2004A");
        expect(tmReleaseDate).toEqual("");
    });

    it("should throw an error if request returns an error code", async () => {
        mock.onGet("/api/tmreleasedate/LMS2004A").reply(500);

        await expect(getTMReleaseDate("LMS2004A")).rejects.toThrow();
    });

    it("should throw an error if request call fails", async () => {
        mock.onGet("/api/tmreleasedate/LMS2004A").networkError();

        await expect(getTMReleaseDate("LMS2004A")).rejects.toThrow();
    });
});

describe("Function deleteTMReleaseDate(questionnaireName: string, tmReleaseDate: string) ", () => {
    afterEach(() => {
        mock.reset();
    });

    it("should return true if created 204 response is returned", async () => {
        mock.onDelete("/api/tmreleasedate/LMS2004A").reply(204);

        const success = await deleteTMReleaseDate("LMS2004A");
        expect(success).toBeTruthy();
    });

    it("should return false if a 404 is returned from the server", async () => {
        mock.onDelete("/api/tmreleasedate/LMS2004A").reply(404);

        const success = await deleteTMReleaseDate("LMS2004A");
        expect(success).toBeFalsy();
    });

    it("should return false if request returns an error code", async () => {
        mock.onDelete("/api/tmreleasedate/LMS2004A").reply(500);

        const success = await deleteTMReleaseDate("LMS2004A");
        expect(success).toEqual(false);
    });

    it("should return false object if request call fails", async () => {
        mock.onDelete("/api/tmreleasedate/LMS2004A").networkError();

        const success = await deleteTMReleaseDate("LMS2004A");
        expect(success).toEqual(false);
    });
});
