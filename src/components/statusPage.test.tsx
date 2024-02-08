/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import flushPromises from "../tests/utils";
import { act } from "react-dom/test-utils";
import StatusPage from "./statusPage";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const mock = new MockAdapter(axios);

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
    beforeEach(() => {
        mock.onGet("/api/health/diagnosis").reply(200, status_list);
    });

    afterEach(() => {
        mock.reset();
    });

    it("view Blaise Status page matches Snapshot", async () => {

        const wrapper = render(
            <MemoryRouter>
                <StatusPage />
            </MemoryRouter>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(wrapper).toMatchSnapshot();
        });
    });

    it("should render correctly", async () => {

        const { getByText, queryByText } = render(
            <MemoryRouter>
                <StatusPage />
            </MemoryRouter>
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
});

describe("Given the API returns a 500 status", () => {
    beforeEach(() => {
        mock.onGet("/api/health/diagnosis").reply(500);
    });

    afterEach(() => {
        mock.reset();
    });

    it("it should render with the error message displayed", async () => {

        const { getByText, queryByText } = render(
            <MemoryRouter>
                <StatusPage />
            </MemoryRouter>
        );

        expect(queryByText(/Checking Blaise status/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(getByText(/Unable to get Blaise status/i)).toBeDefined();
            expect(queryByText(/Checking Blaise status/i)).not.toBeInTheDocument();
        });
    });
});

describe("Given the API returns malformed json", () => {
    beforeEach(() => {
        mock.onGet("/api/health/diagnosis").reply(200, { text: "Hello" });
    });

    afterEach(() => {
        mock.reset();
    });

    it("it should render with the error message displayed", async () => {

        const { getByText, queryByText } = render(
            <MemoryRouter>
                <StatusPage />
            </MemoryRouter>
        );

        expect(queryByText(/Checking Blaise status/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(getByText(/Unable to get Blaise status/i)).toBeDefined();
            expect(queryByText(/Checking Blaise status/i)).not.toBeInTheDocument();
        });
    });
});

describe("Given the API returns an empty list", () => {
    beforeEach(() => {
        mock.onGet("/api/health/diagnosis").reply(200, []);
    });

    afterEach(() => {
        mock.reset();
    });

    it("it should render with a message to inform the user in the list", async () => {

        const { getByText, queryByText } = render(
            <MemoryRouter>
                <StatusPage />
            </MemoryRouter>
        );

        expect(queryByText(/Checking Blaise status/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(getByText(/No connection details found./i)).toBeDefined();
            expect(queryByText(/Checking Blaise status/i)).not.toBeInTheDocument();
        });
    });
});
