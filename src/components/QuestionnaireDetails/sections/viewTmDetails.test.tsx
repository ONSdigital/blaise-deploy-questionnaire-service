/**
 * @jest-environment jsdom
 */

import flushPromises from "../../../tests/utils";
import {render, waitFor, screen} from "@testing-library/react";
import {act} from "react-dom/test-utils";
import React from "react";
import ViewTmDetails from "./viewTmDetails";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import {Router} from "react-router";
import {createMemoryHistory} from "history";
import ViewCatiModeDetails from "./viewCatiModeDetails";

const mock = new MockAdapter(axios);

describe("View Totalmobile details", () => {
    afterEach(() => {
        mock.reset();
    });

    it("should display the Totalmobile details for a LMS questionnaire with a release date", async () => {
        const history = createMemoryHistory();
        mock.onGet("/api/tmreleasedate/LMS2101_AA1").reply(200, {tmreleasedate: "2021-06-27T16:29:00+00:00"});
        const wrapper = render(
            <Router history={history}>
                <ViewTmDetails questionnaireName={"LMS2101_AA1"}/>
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(/Totalmobile details/i)).toBeDefined();
            expect(screen.getByText(/Totalmobile release date/i)).toBeDefined();
            expect(screen.getByText(/Change or delete release date/i)).toBeDefined();
            expect(screen.getByText(/27\/06\/2021/i)).toBeDefined();
        });
    });

    it("should display the add release date option for a LMS questionnaire with no release date", async () => {
        const history = createMemoryHistory();
        mock.onGet("/api/tmreleasedate/LMS2101_AA1").reply(404, {tmreleasedate: ""});
        const wrapper = render(
            <Router history={history}>
                <ViewTmDetails questionnaireName={"LMS2101_AA1"}/>
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(/Totalmobile details/i)).toBeDefined();
            expect(screen.getByText(/No release date specified/i)).toBeDefined();
            expect(screen.getByText(/Add release date/i)).toBeDefined();
        });
    });

    it("should display an error message when it fails to load the Totalmobile release date", async () => {
        const history = createMemoryHistory();
        mock.onGet("/api/tmreleasedate/LMS2101A").reply(500);
        const wrapper = render(
            <Router history={history}>
                <ViewTmDetails questionnaireName={"LMS2101A"}/>
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(/Failed to get Totalmobile release date/i)).toBeDefined();
        });
    });

    it("should not display the Totalmobile details for a non-LMS questionnaire ", async () => {
        const history = createMemoryHistory();
        const date = /27\/06\/2021/i
        mock.onGet("/api/tmreleasedate/OPN2101_AA1").reply(200, {tmreleasedate: "2021-06-27T16:29:00+00:00"});
        const wrapper = render(
            <Router history={history}>
                <ViewTmDetails questionnaireName={"OPN2101_AA1"}/>
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.queryByText(/Totalmobile details/i)).toBeNull();
        });
    });

});
