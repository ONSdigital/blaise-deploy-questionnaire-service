import flushPromises, {mock_server_request_Return_JSON} from "../../../tests/utils";
import {cleanup, render, screen, waitFor} from "@testing-library/react";
import {act} from "react-dom/test-utils";
import React from "react";
import ViewInstrumentSettings from "./ViewInstrumentSettings";
import {opnInstrument} from "../../../features/step_definitions/API_Mock_Objects";
import {createMemoryHistory} from "history";
import {Router} from "react-router";

jest.mock("blaise-api-node-client");
const {InstrumentSettingsMockList} = jest.requireActual("blaise-api-node-client");

describe("Given the API successfully loads the instrument mode", () => {

    beforeAll(() => {
        mock_server_request_Return_JSON(200, ["CATI", "CAWI"]);
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
            // TODO: Helpedy-help
            // expect(screen.getByText(/Type/i)).toBeDefined();
            // expect(screen.getByText(/SaveSessionOnTimeout/i)).toBeDefined();
            // expect(screen.getByText(/SessionTimeout/i)).toBeDefined();
        });
    });

    it("should highlight all invalid fields", async () => {
        // const instrumentList: any[] = [{name: "OPN2101A"}, {name: "OPN2004A"}, {name: "LMS2101_BK2"}];
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
            // TODO: Helpedy-help
            // expect(screen.getByText(/DeleteSessionOnTimeout should be True/i)).toBeDefined();
            // expect(screen.getByText(/DeleteSessionOnQuit should be True/i)).toBeDefined();
            // expect(screen.getByText(/ApplyRecordLocking should be True/i)).toBeDefined();
        });
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});

describe("Given the API successfully loads the instrument settings", () => {

    beforeAll(() => {
        mock_server_request_Return_JSON(200, InstrumentSettingsMockList);
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
            // TODO: Helpedy-help
            // expect(screen.getByText(/Type/i)).toBeDefined();
            // expect(screen.getByText(/SaveSessionOnTimeout/i)).toBeDefined();
            // expect(screen.getByText(/SessionTimeout/i)).toBeDefined();
        });
    });

    it("should highlight all invalid fields", async () => {
        // const instrumentList: any[] = [{name: "OPN2101A"}, {name: "OPN2004A"}, {name: "LMS2101_BK2"}];
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
            // TODO: Helpedy-help
            // expect(screen.getByText(/DeleteSessionOnTimeout should be True/i)).toBeDefined();
            // expect(screen.getByText(/DeleteSessionOnQuit should be True/i)).toBeDefined();
            // expect(screen.getByText(/ApplyRecordLocking should be True/i)).toBeDefined();
        });
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});

describe("Given the API fails to load the instrument mode and/or settings", () => {

    const viewInstrumentSettingsFailedMessage = /Failed to get questionnaire settings/i;
    beforeAll(() => {
        mock_server_request_Return_JSON(500, {});
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
            expect(screen.getByText(/Failed to get questionnaire settings/i)).toBeDefined();
        });
    });
});

describe("Given the API returns an empty list for instrument mode and/or settings", () => {

    beforeAll(() => {
        mock_server_request_Return_JSON(200, []);
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
            expect(screen.getByText(/Failed to get questionnaire settings/i)).toBeDefined();
        });
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});

