/**
 * @jest-environment jsdom
 */

import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import flushPromises from "../tests/utils";
import { act } from "react-dom/test-utils";
import { createMemoryHistory } from "history";
import { Router } from "react-router";
import { Instrument } from "blaise-api-node-client";
import ReinstallInstruments from "./reinstallInstruments";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const mock = new MockAdapter(axios);


const instrumentList: Instrument[] = [{
    name: "OPN2101A",
    serverParkName: "gusty",
    installDate: "2021-01-15T14:41:29.4399898+00:00",
    status: "Active",
    dataRecordCount: 0,
    hasData: false,
    active: false,
    fieldPeriod: "January 2021"
}];

const bucketInstrument: string[] = ["OPN2101A.bpkg", "OPN2004A.bpkg", "LMS2101_BK2.bpkg"];

describe("Reinstall instruments list", () => {
    beforeAll(() => {
        mock.onGet("/api/instruments").reply(200, instrumentList);
        mock.onGet("/bucket/files").reply(200, bucketInstrument);
    });

    it("view Blaise Status page matches Snapshot", async () => {
        const history = createMemoryHistory();
        const wrapper = render(
            <Router history={history}>
                <ReinstallInstruments />
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(wrapper).toMatchSnapshot();
        });
    });

    it("should render correctly", async () => {
        const history = createMemoryHistory();
        render(
            <Router history={history}>
                <ReinstallInstruments />
            </Router>
        );

        await act(async () => {
            await flushPromises();
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(/Reinstall questionnaire/i)).toBeDefined();
            expect(screen.getByText(/OPN2004A/i)).toBeDefined();
            expect(screen.getByText(/LMS2101_BK2/i)).toBeDefined();
            expect(screen.queryByText(/OPN2101A/i)).not.toBeInTheDocument();
        });
    });

    it("should render a message if all items in bucket are already installed", async () => {
        const instrumentList: any[] = [{ name: "OPN2101A" }, { name: "OPN2004A" }, { name: "LMS2101_BK2" }];

        mock.onGet("/api/instruments").reply(200, instrumentList);

        const history = createMemoryHistory();
        render(
            <Router history={history}>
                <ReinstallInstruments />
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(/Reinstall questionnaire/i)).toBeDefined();
            expect(screen.getByText(/No compatible previously installed questionnaires found./i)).toBeDefined();
        });
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });
});

describe("Reinstall an instruments", () => {
    beforeAll(() => {
        mock.onGet("/api/instruments").reply(200, []);
        mock.onGet("/bucket/files").reply(200, bucketInstrument);
        mock.onGet("/upload/verify?filename=OPN2004A.bpkg").reply(200, { name: "OPN2004A.bpkg" });
        mock.onPost("/api/install").reply(201);
    });

    it("should redirect to the success page after install", async () => {
        const history = createMemoryHistory();
        render(
            <Router history={history}>
                <ReinstallInstruments />
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        await act(async () => {
            fireEvent.click(screen.getByText(/OPN2004A/i));
            await flushPromises();
            fireEvent.click(screen.getByText(/Install selected questionnaire/i));
            await flushPromises();
        });

        await waitFor(() => {
            // Check page has been redirected to summary page
            expect(history.location.pathname).toEqual("/UploadSummary");
            // State should be blank as its successful
            expect(history.location.state).toEqual({ questionnaireName: "OPN2004A", status: "" });
        });
    });

    it("should render a message if all items in bucket are already installed", async () => {
        const instrumentList: any[] = [{ name: "OPN2101A" }, { name: "OPN2004A" }, { name: "LMS2101_BK2" }];

        mock.onGet("/api/instruments").reply(200, instrumentList);

        const history = createMemoryHistory();
        render(
            <Router history={history}>
                <ReinstallInstruments />
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(/Reinstall questionnaire/i)).toBeDefined();
            expect(screen.getByText(/No compatible previously installed questionnaires found./i)).toBeDefined();
        });
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });
});

describe("Given the API returns a 500 status", () => {
    beforeAll(() => {
        mock.onGet("/api/instruments").reply(500);
    });

    it("it should render with the error message displayed", async () => {
        const history = createMemoryHistory();
        render(
            <Router history={history}>
                <ReinstallInstruments />
            </Router>
        );


        await waitFor(() => {
            expect(screen.getByText(/Unable to load questionnaires./i)).toBeDefined();
            expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
        });

    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });
});

describe("Given the API returns an empty list", () => {
    beforeAll(() => {
        mock.onGet("/api/instruments").reply(200, []);
        mock.onGet("/bucket/files").reply(200, []);
    });

    it("it should render with a message to inform the user in the list", async () => {
        const history = createMemoryHistory();
        render(
            <Router history={history}>
                <ReinstallInstruments />
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(/Reinstall questionnaire/i)).toBeDefined();
            expect(screen.getByText(/No compatible previously installed questionnaires found./i)).toBeDefined();
        });
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });
});
