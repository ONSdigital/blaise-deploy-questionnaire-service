/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, waitFor, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import flushPromises, { mock_server_request_Return_JSON } from "../tests/utils";
import { act } from "react-dom/test-utils";
import { createMemoryHistory } from "history";
import StatusPage from "./statusPage";
import { Router } from "react-router";


const status_list = [
    {
        "health check type": "Connection model",
        "status": "OK"
    },
    {
        "health check type": "Blaise connection",
        "status": "OK"
    },
    {
        "health check type": "Remote data server connection",
        "status": "OK"
    },
    {
        "health check type": "Remote Cati management connection",
        "status": "OK"
    }
];

describe("Blaise Status page", () => {

    beforeAll(() => {
        mock_server_request_Return_JSON(200, status_list);
    });

    it("view Blaise Status page matches Snapshot", async () => {
        const history = createMemoryHistory();
        const wrapper = render(
            <Router history={history}>
                <StatusPage />
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
        const { getByText, queryByText } = render(
            <Router history={history}>
                <StatusPage />
            </Router>
        );

        expect(queryByText(/Checking Blaise status/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(getByText(/Blaise connection status/i)).toBeDefined();
            expect(queryByText(/Checking Blaise status/i)).not.toBeInTheDocument();
        });

        await waitFor(() => {
            expect(getByText(/Blaise connection status/i)).toBeDefined();
            expect(getByText(/Connection model/i)).toBeDefined();
            expect(getByText(/Remote Cati management connection/i)).toBeDefined();
            expect(queryByText(/Checking Blaise status/i)).not.toBeInTheDocument();
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
        const { getByText, queryByText } = render(
            <Router history={history}>
                <StatusPage />
            </Router>
        );

        expect(queryByText(/Checking Blaise status/i)).toBeInTheDocument();


        await waitFor(() => {
            expect(getByText(/Unable to get Blaise status/i)).toBeDefined();
            expect(queryByText(/Checking Blaise status/i)).not.toBeInTheDocument();
        });

    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});

describe("Given the API returns malformed json", () => {

    beforeAll(() => {
        mock_server_request_Return_JSON(200, { text: "Hello" });
    });

    it("it should render with the error message displayed", async () => {
        const history = createMemoryHistory();
        const { getByText, queryByText } = render(
            <Router history={history}>
                <StatusPage />
            </Router>
        );

        expect(queryByText(/Checking Blaise status/i)).toBeInTheDocument();


        await waitFor(() => {
            expect(getByText(/Unable to get Blaise status/i)).toBeDefined();
            expect(queryByText(/Checking Blaise status/i)).not.toBeInTheDocument();
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
        const { getByText, queryByText } = render(
            <Router history={history}>
                <StatusPage />
            </Router>
        );

        expect(queryByText(/Checking Blaise status/i)).toBeInTheDocument();


        await waitFor(() => {
            expect(getByText(/No connection details found./i)).toBeDefined();
            expect(queryByText(/Checking Blaise status/i)).not.toBeInTheDocument();
        });

    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});
