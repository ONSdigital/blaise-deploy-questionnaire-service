import flushPromises from "../../../tests/utils";
import {cleanup, render, screen, waitFor} from "@testing-library/react";
import {act} from "react-dom/test-utils";
import React from "react";
import ViewInstrumentSettings from "./ViewInstrumentSettings";
import {opnInstrument} from "../../../features/step_definitions/API_Mock_Objects";
import {createMemoryHistory} from "history";
import {Router} from "react-router";
import {mock_fetch_requests} from "../../../features/step_definitions/functions";

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


describe("Given the API successfully loads the instrument mode and settings for CATI only mode", () => {

    const mock_server_responses = (url: string) => {
        console.log(url);
        if (url.includes("/modes")) {
            return Promise.resolve({
                status: 200,
                json: () => Promise.resolve(["CATI"]),
            });
        }
        if (url.includes("/settings")) {
            return Promise.resolve({
                status: 200,
                json: () => Promise.resolve(InstrumentSettingsMockList),
            });
        }
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve([]),
        });
    };

    beforeAll(() => {
        mock_fetch_requests(mock_server_responses);
    });

    it("matches Snapshot for the view Instrument Settings page", async () => {
        const history = createMemoryHistory();
        const wrapper = render(
            <Router history={history}>
                <ViewInstrumentSettings instrument={opnInstrument}/>
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
                <ViewInstrumentSettings instrument={opnInstrument}/>
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
                <ViewInstrumentSettings instrument={opnInstrument}/>
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(/SaveSessionOnTimeout should be True/i)).toBeDefined();
        });
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});

describe("Given the API successfully loads the instrument mode and settings for mixed mode", () => {

    const mock_server_responses = (url: string) => {
        console.log(url);
        if (url.includes("/modes")) {
            return Promise.resolve({
                status: 200,
                json: () => Promise.resolve(["CATI", "CAWI"]),
            });
        }
        if (url.includes("/settings")) {
            return Promise.resolve({
                status: 200,
                json: () => Promise.resolve(InstrumentSettingsMockList),
            });
        }
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve([]),
        });
    };

    beforeAll(() => {
        mock_fetch_requests(mock_server_responses);
    });

    it("matches Snapshot for the view Instrument Settings page", async () => {
        const history = createMemoryHistory();
        const wrapper = render(
            <Router history={history}>
                <ViewInstrumentSettings instrument={opnInstrument}/>
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
                <ViewInstrumentSettings instrument={opnInstrument}/>
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
                <ViewInstrumentSettings instrument={opnInstrument}/>
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

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});

describe("Given the API fails to load the instrument mode and settings", () => {

    const mock_server_responses = (url: string) => {
        console.log(url);
        if (url.includes("/modes")) {
            return Promise.resolve({
                status: 500,
                json: () => Promise.resolve({}),
            });
        }
        if (url.includes("/settings")) {
            return Promise.resolve({
                status: 500,
                json: () => Promise.resolve({}),
            });
        }
        return Promise.resolve({
            status: 500,
            json: () => Promise.resolve({}),
        });
    };

    beforeAll(() => {
        mock_fetch_requests(mock_server_responses);
    });

    it("should display an error message when it fails to load the Instrument Modes", async () => {
        render(
            <ViewInstrumentSettings instrument={opnInstrument}/>
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

describe("Given the API returns an empty list for instrument mode and/or settings", () => {

    const mock_server_responses = (url: string) => {
        console.log(url);
        if (url.includes("/modes")) {
            return Promise.resolve({
                status: 200,
                json: () => Promise.resolve([]),
            });
        }
        if (url.includes("/settings")) {
            return Promise.resolve({
                status: 200,
                json: () => Promise.resolve([]),
            });
        }
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve([]),
        });
    };

    beforeAll(() => {
        mock_fetch_requests(mock_server_responses);
    });

    it("it should render an error message", async () => {
        const history = createMemoryHistory();
        render(
            <Router history={history}>
                <ViewInstrumentSettings instrument={opnInstrument}/>
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(viewInstrumentSettingsFailedMessage)).toBeDefined();
        });
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});
