/**
 * @jest-environment jsdom
 */

import flushPromises from "../../tests/utils";
import { render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import React from "react";
import TotalmobileDetails from "./totalmobileDetails";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { Router } from "react-router-dom";
import { createMemoryHistory } from "history";
import "@testing-library/jest-dom";

const mock = new MockAdapter(axios);

describe("View Totalmobile details", () => {
    afterEach(() => {
        mock.reset();
    });

    it("should display the Totalmobile details for a LMS questionnaire with a release date", async () => {
        const history = createMemoryHistory();
        mock.onGet("/api/tmreleasedate/LMS2101_AA1").reply(200, { tmreleasedate: "2021-06-27T16:29:00+00:00" });
        const rerender = render(
            <Router history={history}>
                <TotalmobileDetails questionnaireName={"LMS2101_AA1"}/>
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        expect(await screen.findByText(/Totalmobile details/i)).toBeInTheDocument();
        expect(await screen.findByText(/Totalmobile release date/i)).toBeInTheDocument();
        expect(await screen.findByText(/Change or delete release date/i)).toBeInTheDocument();
        expect(await screen.findByText(/27\/06\/2021/i)).toBeInTheDocument();

    });

    it("should display the add release date option for a LMS questionnaire with no release date", async () => {
        const history = createMemoryHistory();
        mock.onGet("/api/tmreleasedate/LMS2101_AA1").reply(404, { tmreleasedate: "" });
        const rerender = render(
            <Router history={history}>
                <TotalmobileDetails questionnaireName={"LMS2101_AA1"}/>
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        expect(await screen.findByText(/Totalmobile details/i)).toBeInTheDocument();
        expect(await screen.findByText(/No release date specified/i)).toBeInTheDocument();
        expect(await screen.findByText(/Add release date/i)).toBeInTheDocument();

    });

    it("should display an error message when it fails to load the Totalmobile release date", async () => {
        const history = createMemoryHistory();
        mock.onGet("/api/tmreleasedate/LMS2101A").reply(500);
        const rerender = render(
            <Router history={history}>
                <TotalmobileDetails questionnaireName={"LMS2101A"}/>
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        expect(await screen.findByText(/Failed to get Totalmobile release date/i)).toBeInTheDocument();
    });

    it("should not display the Totalmobile details for a non-LMS questionnaire ", async () => {
        const history = createMemoryHistory();
        const date = /27\/06\/2021/i;
        mock.onGet("/api/tmreleasedate/OPN2101_AA1").reply(200, { tmreleasedate: "2021-06-27T16:29:00+00:00" });
        const rerender = render(
            <Router history={history}>
                <TotalmobileDetails questionnaireName={"OPN2101_AA1"}/>
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        expect(await screen.queryByText(/Totalmobile details/i)).not.toBeInTheDocument();
    });
});
