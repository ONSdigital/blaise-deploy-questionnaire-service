import axios from "axios";
import MockAdapter from "axios-mock-adapter";

import { deleteTmReleaseDate, getTmReleaseDate, setTmReleaseDate } from "./tmReleaseDate";

const mock = new MockAdapter(axios);

describe("Function setTmReleaseDate(questionnaireName: string, tmReleaseDate: string) ", () => {
  afterEach(() => {
    mock.reset();
  });

  it("should return true if created 201 response is returned", async () => {
    mock.onPost("/api/tmreleasedate/LMS2004A").reply(201);

    const success = await setTmReleaseDate("LMS2004A", "2020-01-01");

    expect(success).toBeTruthy();
  });

  it("should return false if a 404 is returned from the server", async () => {
    mock.onPost("/api/tmreleasedate/LMS2004A").reply(404);

    const success = await setTmReleaseDate("LMS2004A", "2020-01-01");

    expect(success).toBeFalsy();
  });

  it("should return false if request returns an error code", async () => {
    mock.onPost("/api/tmreleasedate/LMS2004A").reply(500);

    const success = await setTmReleaseDate("LMS2004A", "2020-01-01");

    expect(success).toEqual(false);
  });

  it("should return false object if request call fails", async () => {
    mock.onPost("/api/tmreleasedate/LMS2004A").networkError();

    const success = await setTmReleaseDate("LMS2004A", "2020-01-01");

    expect(success).toEqual(false);
  });
});

describe("Function getTmReleaseDate(questionnaireName: string) ", () => {
  afterEach(() => {
    mock.reset();
  });

  it("should return true and a TM release date string if object with the correct name returned", async () => {
    mock.onGet("/api/tmreleasedate/LMS2004A").reply(200, { tmreleasedate: "1997-12-24" });

    const tmReleaseDate = await getTmReleaseDate("LMS2004A");

    expect(tmReleaseDate).toEqual("1997-12-24");
  });

  it("should return an empty string if object without a TM release date is returned", async () => {
    mock.onGet("/api/tmreleasedate/LMS2004A").reply(200, { name: "BACON" });

    const tmReleaseDate = await getTmReleaseDate("LMS2004A");

    expect(tmReleaseDate).toEqual("");
  });

  it("should return an empty string if a 404 is returned from the server", async () => {
    mock.onGet("/api/tmreleasedate/LMS2004A").reply(404);

    const tmReleaseDate = await getTmReleaseDate("LMS2004A");

    expect(tmReleaseDate).toEqual("");
  });

  it("should return an empty string if a 204 is returned from the server", async () => {
    mock.onGet("/api/tmreleasedate/LMS2004A").reply(204);

    const tmReleaseDate = await getTmReleaseDate("LMS2004A");

    expect(tmReleaseDate).toEqual("");
  });

  it("should return a TM release date string if the server returns a raw string", async () => {
    mock.onGet("/api/tmreleasedate/LMS2004A").reply(200, "1997-12-24");

    const tmReleaseDate = await getTmReleaseDate("LMS2004A");

    expect(tmReleaseDate).toEqual("1997-12-24");
  });

  it("should throw an error if request returns an error code", async () => {
    mock.onGet("/api/tmreleasedate/LMS2004A").reply(500);

    await expect(getTmReleaseDate("LMS2004A")).rejects.toThrow();
  });

  it("should throw an error if request call fails", async () => {
    mock.onGet("/api/tmreleasedate/LMS2004A").networkError();

    await expect(getTmReleaseDate("LMS2004A")).rejects.toThrow();
  });
});

describe("Function deleteTmReleaseDate(questionnaireName: string, tmReleaseDate: string) ", () => {
  afterEach(() => {
    mock.reset();
  });

  it("should return true if created 204 response is returned", async () => {
    mock.onDelete("/api/tmreleasedate/LMS2004A").reply(204);

    const success = await deleteTmReleaseDate("LMS2004A");

    expect(success).toBeTruthy();
  });

  it("should return false if a 404 is returned from the server", async () => {
    mock.onDelete("/api/tmreleasedate/LMS2004A").reply(404);

    const success = await deleteTmReleaseDate("LMS2004A");

    expect(success).toBeFalsy();
  });

  it("should return false if request returns an error code", async () => {
    mock.onDelete("/api/tmreleasedate/LMS2004A").reply(500);

    const success = await deleteTmReleaseDate("LMS2004A");

    expect(success).toEqual(false);
  });

  it("should return false object if request call fails", async () => {
    mock.onDelete("/api/tmreleasedate/LMS2004A").networkError();

    const success = await deleteTmReleaseDate("LMS2004A");

    expect(success).toEqual(false);
  });
});
