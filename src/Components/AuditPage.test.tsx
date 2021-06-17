import React from "react";
import {render, waitFor, cleanup, fireEvent, screen} from "@testing-library/react";
import "@testing-library/jest-dom";
import flushPromises, {mock_server_request_Return_JSON} from "../tests/utils";
import {act} from "react-dom/test-utils";
import {createMemoryHistory} from "history";
import {Router} from "react-router";
import AuditPage from "./AuditPage";


const auditLogsList = [
    {id: "602fb3250003c61e92b25da0", timestamp: "Fri Feb 19 2021 12:46:29 GMT+0000 (Greenwich Mean Time)", message: "Successfully uninstalled questionnaire OPN2012K", severity: "INFO"}
];

const auditLogsList2 = [
    {id: "602fb3250003c61e92b25da0", timestamp: "Fri Feb 19 2021 12:47:29 GMT+0000 (Greenwich Mean Time)", message: "Successfully installed questionnaire OPN2012K", severity: "INFO"}
];

describe("Audit Logs page", () => {

    beforeEach(() => {
        mock_server_request_Return_JSON(200, auditLogsList);
    });

    it("view Audit Logs page matches Snapshot", async () => {
        const history = createMemoryHistory();
        const wrapper = render(
            <Router history={history}>
                <AuditPage/>
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
        const {getByText, queryByText} = render(
            <Router history={history}>
                <AuditPage/>
            </Router>
        );

        expect(queryByText(/Loading/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(getByText(/Questionnaire deployment history/i)).toBeDefined();
            expect(queryByText(/Loading/i)).not.toBeInTheDocument();
        });

        await waitFor(() => {
            expect(getByText(/Questionnaire deployment history/i)).toBeDefined();
            expect(getByText(/Successfully uninstalled questionnaire OPN2012K/i)).toBeDefined();
            expect(getByText(/19\/02\/2021 12:46:29/i)).toBeDefined();
            expect(queryByText(/Loading/i)).not.toBeInTheDocument();
        });
    });

    it("should refresh the list when you press the Reload logs button", async () => {
        const history = createMemoryHistory();
        const {getByText} = render(
            <Router history={history}>
                <AuditPage/>
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(getByText(/Successfully uninstalled questionnaire OPN2012K/i)).toBeDefined();
            expect(getByText(/19\/02\/2021 12:46:29/i)).toBeDefined();
        });

        mock_server_request_Return_JSON(200, auditLogsList2);

        await fireEvent.click(screen.getByText("Reload"));

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(getByText(/Successfully installed questionnaire OPN2012K/i)).toBeDefined();
            expect(getByText(/19\/02\/2021 12:47:29/i)).toBeDefined();
        });
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});

describe("Given the API returns a 500 status", () => {

    beforeEach(() => {
        mock_server_request_Return_JSON(500, []);
    });

    it("it should render with the error message displayed", async () => {
        const history = createMemoryHistory();
        const {getByText, queryByText} = render(
            <Router history={history}>
                <AuditPage/>
            </Router>
        );

        expect(queryByText(/Loading/i)).toBeInTheDocument();


        await waitFor(() => {
            expect(getByText(/Unable to load deployment history./i)).toBeDefined();
            expect(queryByText(/Loading/i)).not.toBeInTheDocument();
        });

    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});

describe("Given the API returns malformed json", () => {

    beforeAll(() => {
        mock_server_request_Return_JSON(200, {text: "Hello"});
    });

    it("it should render with the error message displayed", async () => {
        const history = createMemoryHistory();
        const {getByText, queryByText} = render(
            <Router history={history}>
                <AuditPage/>
            </Router>
        );

        expect(queryByText(/Loading/i)).toBeInTheDocument();


        await waitFor(() => {
            expect(getByText(/Unable to load deployment history./i)).toBeDefined();
            expect(queryByText(/Loading/i)).not.toBeInTheDocument();
        });

    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});

describe("Given the API returns an empty list", () => {

    beforeEach(() => {
        mock_server_request_Return_JSON(200, []);
    });

    it("it should render with a message to inform the user in the list", async () => {
        const history = createMemoryHistory();
        const {getByText, queryByText} = render(
            <Router history={history}>
                <AuditPage/>
            </Router>
        );

        expect(queryByText(/Loading/i)).toBeInTheDocument();


        await waitFor(() => {
            expect(getByText(/No recent deployment history found./i)).toBeDefined();
            expect(queryByText(/Loading/i)).not.toBeInTheDocument();
        });

    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});
