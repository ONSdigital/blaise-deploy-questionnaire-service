/**
 * @jest-environment jsdom
 */

import flushPromises from "../../../tests/utils";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import React from "react";
import ViewInstrumentSettings from "./viewInstrumentSettings";
import { opnInstrument } from "../../../features/step_definitions/helpers/apiMockObjects";
import { createMemoryHistory } from "history";
import { Router } from "react-router";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const viewInstrumentSettingsFailedMessage = /Failed to get questionnaire settings/i;
const InstrumentSettingsMockList = [
    {
        "type": "StrictInterviewing",
        "saveSessionOnTimeout": false,
        "saveSessionOnQuit": true,
        "deleteSessionOnTimeout": false,
        "deleteSessionOnQuit": false,
        "sessionTimeout": 15,
        "applyRecordLocking": false
    }
];

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

describe("Given the API successfully loads the instrument mode and settings for CATI only mode", () => {
    beforeEach(() => {
        mock.onGet(`/api/instruments/${opnInstrument.name}/modes`).reply(200, ["CATI"]);
        mock.onGet(`/api/instruments/${opnInstrument.name}/settings`).reply(200, InstrumentSettingsMockList);
    });

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });

    it("matches Snapshot for the view Instrument Settings page", async () => {
        const history = createMemoryHistory();
        const wrapper = render(
            <Router history={history}>
                <ViewInstrumentSettings instrument={opnInstrument} />
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
                <ViewInstrumentSettings instrument={opnInstrument} />
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(/Questionnaire settings/i)).toBeDefined();
            expect(screen.getByText(/Type/i)).toBeDefined();
            expect(screen.getByText(/SaveSessionOnQuit/i)).toBeDefined();
            expect(screen.getByText(/SessionTimeout/i)).toBeDefined();
        });
    });

    it("should highlight all invalid fields", async () => {
        const history = createMemoryHistory();
        render(
            <Router history={history}>
                <ViewInstrumentSettings instrument={opnInstrument} />
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(/SaveSessionOnTimeout should be True/i)).toBeDefined();
        });
    });
});

describe("Given the API successfully loads the instrument mode and settings for mixed mode", () => {
    beforeEach(() => {
        mock.onGet(`/api/instruments/${opnInstrument.name}/modes`).reply(200, ["CATI", "CAWI"]);
        mock.onGet(`/api/instruments/${opnInstrument.name}/settings`).reply(200, InstrumentSettingsMockList);
    });

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });

    it("matches Snapshot for the view Instrument Settings page", async () => {
        const history = createMemoryHistory();
        const wrapper = render(
            <Router history={history}>
                <ViewInstrumentSettings instrument={opnInstrument} />
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
                <ViewInstrumentSettings instrument={opnInstrument} />
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(/Questionnaire settings/i)).toBeDefined();
            expect(screen.getByText(/Type/i)).toBeDefined();
            expect(screen.getByText(/SaveSessionOnQuit/i)).toBeDefined();
            expect(screen.getByText(/SessionTimeout/i)).toBeDefined();
        });
    });

    it("should highlight all invalid fields", async () => {
        const history = createMemoryHistory();
        render(
            <Router history={history}>
                <ViewInstrumentSettings instrument={opnInstrument} />
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(/SaveSessionOnTimeout should be True/i)).toBeDefined();
            expect(screen.getByText(/DeleteSessionOnTimeout should be True/i)).toBeDefined();
            expect(screen.getByText(/DeleteSessionOnQuit should be True/i)).toBeDefined();
            expect(screen.getByText(/ApplyRecordLocking should be True/i)).toBeDefined();
        });
    });
});

describe("Given the API fails to load the instrument mode or settings", () => {
    beforeEach(() => {
        mock.onGet(`/api/instruments/${opnInstrument.name}/modes`).reply(500);
        mock.onGet(`/api/instruments/${opnInstrument.name}/settings`).reply(500);
    });

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });

    it("should display an error message when it fails to load the Instrument Modes", async () => {
        render(
            <ViewInstrumentSettings instrument={opnInstrument} />
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(viewInstrumentSettingsFailedMessage)).toBeDefined();
        });
    });

    it("should display an error message when it fails to load the Instrument Settings", async () => {
        render(
            <ViewInstrumentSettings instrument={opnInstrument}
            />
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(viewInstrumentSettingsFailedMessage)).toBeDefined();
        });
    });
});

describe("Given the API returns an empty list for instrument mode or settings", () => {
    beforeEach(() => {
        mock.onGet(`/api/instruments/${opnInstrument.name}/modes`).reply(200, []);
        mock.onGet(`/api/instruments/${opnInstrument.name}/settings`).reply(200, []);
    });

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });

    it("it should render an error message", async () => {
        const history = createMemoryHistory();
        render(
            <Router history={history}>
                <ViewInstrumentSettings instrument={opnInstrument} />
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(viewInstrumentSettingsFailedMessage)).toBeDefined();
        });
    });
});
