import axios from "axios";
import MockAdapter from "axios-mock-adapter";

import { deleteToStartDate, getToStartDate, setToStartDate } from "./toStartDate";

const mock = new MockAdapter(axios);

describe("Function setToStartDate(questionnaireName: string, toStartDate: string) ", () => {
  afterEach(() => {
    mock.reset();
  });

  it("should return true if created 201 response is returned", async () => {
    mock.onPost("/api/tostartdate/OPN2004A").reply(201);

    const success = await setToStartDate("OPN2004A", "2020-01-01");

    expect(success).toBeTruthy();
  });

  it("should return false if a 404 is returned from the server", async () => {
    mock.onPost("/api/tostartdate/OPN2004A").reply(404);

    const success = await setToStartDate("OPN2004A", "2020-01-01");

    expect(success).toBeFalsy();
  });

  it("should return false if request returns an error code", async () => {
    mock.onPost("/api/tostartdate/OPN2004A").reply(500);

    const success = await setToStartDate("OPN2004A", "2020-01-01");

    expect(success).toEqual(false);
  });

  it("should return false object if request call fails", async () => {
    mock.onPost("/api/tostartdate/OPN2004A").networkError();

    const success = await setToStartDate("OPN2004A", "2020-01-01");

    expect(success).toEqual(false);
  });
});

describe("Function getToStartDate(questionnaireName: string) ", () => {
  afterEach(() => {
    mock.reset();
  });

  it("should return a Telephone Operations start date string if the response contains a start date", async () => {
    mock.onGet("/api/tostartdate/OPN2004A").reply(200, { tostartdate: "1997-12-24" });

    const toStartDate = await getToStartDate("OPN2004A");

    expect(toStartDate).toEqual("1997-12-24");
  });

  it("should return an empty string if the response does not contain a Telephone Operations start date", async () => {
    mock.onGet("/api/tostartdate/OPN2004A").reply(200, { name: "BACON" });

    const toStartDate = await getToStartDate("OPN2004A");

    expect(toStartDate).toEqual("");
  });

  it("should return an empty string if a 404 is returned from the server", async () => {
    mock.onGet("/api/tostartdate/OPN2004A").reply(404);

    const toStartDate = await getToStartDate("OPN2004A");

    expect(toStartDate).toEqual("");
  });

  it("should throw an error if request returns an error code", async () => {
    mock.onGet("/api/tostartdate/OPN2004A").reply(500);

    await expect(getToStartDate("OPN2004A")).rejects.toThrow();
  });

  it("should throw an error if request call fails", async () => {
    mock.onGet("/api/tostartdate/OPN2004A").networkError();

    await expect(getToStartDate("OPN2004A")).rejects.toThrow();
  });
});

describe("Function deleteToStartDate(questionnaireName: string, toStartDate: string) ", () => {
  afterEach(() => {
    mock.reset();
  });

  it("should return true if created 204 response is returned", async () => {
    mock.onDelete("/api/tostartdate/OPN2004A").reply(204);

    const success = await deleteToStartDate("OPN2004A");

    expect(success).toBeTruthy();
  });

  it("should return false if a 404 is returned from the server", async () => {
    mock.onDelete("/api/tostartdate/OPN2004A").reply(404);

    const success = await deleteToStartDate("OPN2004A");

    expect(success).toBeFalsy();
  });

  it("should return false if request returns an error code", async () => {
    mock.onDelete("/api/tostartdate/OPN2004A").reply(500);

    const success = await deleteToStartDate("OPN2004A");

    expect(success).toEqual(false);
  });

  it("should return false object if request call fails", async () => {
    mock.onDelete("/api/tostartdate/OPN2004A").networkError();

    const success = await deleteToStartDate("OPN2004A");

    expect(success).toEqual(false);
  });
});
