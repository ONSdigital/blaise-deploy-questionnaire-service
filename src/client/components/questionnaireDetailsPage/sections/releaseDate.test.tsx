import { render, screen } from "@testing-library/react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { act } from "react-dom/test-utils";
import { BrowserRouter } from "react-router-dom";

import flushPromises from "../../../test-utils/flushPromises";
import { createWrapper } from "../../../test-utils/renderWithQueryClient";

import { ReleaseDate } from "./releaseDate";
import "@testing-library/jest-dom";

const mock = new MockAdapter(axios);

describe("Totalmobile details", () => {
  afterEach(() => {
    mock.reset();
  });

  it("should display the Totalmobile details for an LMS questionnaire with a release date", async () => {
    mock
      .onGet("/api/tmreleasedate/LMS2101_AA1")
      .reply(200, { tmreleasedate: "2021-06-27T16:29:00+00:00" });
    render(<ReleaseDate questionnaireName={"LMS2101_AA1"} />, {
      wrapper: createWrapper(BrowserRouter),
    });

    await act(async () => {
      await flushPromises();
    });

    expect(await screen.findByText(/Totalmobile details/i)).toBeInTheDocument();
    expect(await screen.findByText(/Totalmobile release date/i)).toBeInTheDocument();
    expect(await screen.findByText(/Change or delete release date/i)).toBeInTheDocument();
    expect(await screen.findByText(/27\/06\/2021/i)).toBeInTheDocument();
  });

  it("should display the add release date option for an LMS questionnaire with no release date", async () => {
    mock.onGet("/api/tmreleasedate/LMS2101_AA1").reply(404, { tmreleasedate: "" });
    render(<ReleaseDate questionnaireName={"LMS2101_AA1"} />, {
      wrapper: createWrapper(BrowserRouter),
    });

    await act(async () => {
      await flushPromises();
    });

    expect(await screen.findByText(/Totalmobile details/i)).toBeInTheDocument();
    expect(await screen.findByText(/No release date specified/i)).toBeInTheDocument();
    expect(await screen.findByText(/Add release date/i)).toBeInTheDocument();
  });

  it("should render an invalid Totalmobile release date value without crashing", async () => {
    mock.onGet("/api/tmreleasedate/LMS2101_AA1").reply(200, { tmreleasedate: "not-a-date" });
    render(<ReleaseDate questionnaireName={"LMS2101_AA1"} />, {
      wrapper: createWrapper(BrowserRouter),
    });

    await act(async () => {
      await flushPromises();
    });

    expect(await screen.findByText(/Totalmobile details/i)).toBeInTheDocument();
    expect(await screen.findByText("not-a-date")).toBeInTheDocument();
  });

  it("should display an error message when it fails to load the Totalmobile release date", async () => {
    mock.onGet("/api/tmreleasedate/LMS2101A").reply(500);
    render(<ReleaseDate questionnaireName={"LMS2101A"} />, {
      wrapper: createWrapper(BrowserRouter),
    });

    await act(async () => {
      await flushPromises();
    });

    expect(await screen.findByText(/Failed to get Totalmobile release date/i)).toBeInTheDocument();
  });

  it("should display the Totalmobile details for a DST questionnaire", async () => {
    mock
      .onGet("/api/tmreleasedate/DST2101_AA1")
      .reply(200, { tmreleasedate: "2021-06-27T16:29:00+00:00" });
    render(<ReleaseDate questionnaireName={"DST2101_AA1"} />, {
      wrapper: createWrapper(BrowserRouter),
    });

    await act(async () => {
      await flushPromises();
    });

    expect(await screen.findByText(/Totalmobile details/i)).toBeInTheDocument();
  });

  it("should not display the Totalmobile details for an FRS questionnaire", async () => {
    mock
      .onGet("/api/tmreleasedate/FRS2101_AA1")
      .reply(200, { tmreleasedate: "2021-06-27T16:29:00+00:00" });
    render(<ReleaseDate questionnaireName={"FRS2101_AA1"} />, {
      wrapper: createWrapper(BrowserRouter),
    });

    await act(async () => {
      await flushPromises();
    });

    expect(await screen.queryByText(/Totalmobile details/i)).not.toBeInTheDocument();
  });

  it("should not display the Totalmobile details for a non-LMS questionnaire ", async () => {
    mock
      .onGet("/api/tmreleasedate/OPN2101_AA1")
      .reply(200, { tmreleasedate: "2021-06-27T16:29:00+00:00" });
    render(<ReleaseDate questionnaireName={"OPN2101_AA1"} />, {
      wrapper: createWrapper(BrowserRouter),
    });

    await act(async () => {
      await flushPromises();
    });

    expect(await screen.queryByText(/Totalmobile details/i)).not.toBeInTheDocument();
  });
});
