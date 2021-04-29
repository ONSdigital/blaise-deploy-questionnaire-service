import React from "react";
import {render, waitFor, cleanup, screen} from "@testing-library/react";
import "@testing-library/jest-dom";
import flushPromises, {mock_server_request_Return_JSON} from "../tests/utils";
import {act} from "react-dom/test-utils";
import {createMemoryHistory} from "history";
import {Router} from "react-router";
import {Instrument} from "../../Interfaces";
import ReinstallInstruments from "./ReinstallInstruments";


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

const bucketInstrument: string[] = ["OPN2101A.bpkg", "OPN2004A.bpkg", "LMS2101_BK2.bpkg"]

describe("Reinstall instruments list", () => {

    beforeAll(() => {
        mock_server_request_Return_JSON(200, bucketInstrument);
    });

    it("view Blaise Status page matches Snapshot", async () => {
        const history = createMemoryHistory();
        const wrapper = render(
            <Router history={history}>
                <ReinstallInstruments installedInstruments={instrumentList}/>
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
                <ReinstallInstruments installedInstruments={instrumentList}/>
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
        const instrumentList: any[] = [{name: "OPN2101A"}, {name: "OPN2004A"}, {name: "LMS2101_BK2"}];
        const history = createMemoryHistory();
        render(
            <Router history={history}>
                <ReinstallInstruments installedInstruments={instrumentList}/>
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
    });
});

describe("Given the API returns a 500 status", () => {

    beforeAll(() => {
        mock_server_request_Return_JSON(500, []);
    });

    it("it should render with the error message displayed", async () => {
        const history = createMemoryHistory();
        render(
            <Router history={history}>
                <ReinstallInstruments installedInstruments={instrumentList}/>
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
    });
});

describe("Given the API returns an empty list", () => {

    beforeAll(() => {
        mock_server_request_Return_JSON(200, []);
    });

    it("it should render with a message to inform the user in the list", async () => {
        const history = createMemoryHistory();
        render(
            <Router history={history}>
                <ReinstallInstruments installedInstruments={instrumentList}/>
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
    });
});
