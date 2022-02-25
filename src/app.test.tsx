/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, waitFor, cleanup, screen } from "@testing-library/react";
import App from "./app";
import "@testing-library/jest-dom";
import flushPromises from "./tests/utils";
import { act } from "react-dom/test-utils";
import { createMemoryHistory } from "history";
import { Router } from "react-router";
import { instrumentList } from "./features/step_definitions/helpers/apiMockObjects";
import _ from "lodash";
import { AuthManager } from "blaise-login-react-client";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const mock = new MockAdapter(axios);

jest.mock("blaise-login-react-client");
AuthManager.prototype.loggedIn = jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
});

const mockIsProduction = jest.fn();

jest.mock("./client/env", () => ({
    isProduction: () => mockIsProduction()
}));

describe("React homepage", () => {
    beforeEach(() => {
        mockIsProduction.mockReturnValue(false);
    });

    beforeAll(() => {
        mock.onGet("/api/instruments").reply(200, instrumentList);
    });

    it("view instrument page matches Snapshot in production", async () => {
        mockIsProduction.mockReturnValue(true);
        const history = createMemoryHistory();
        const wrapper = render(
            <Router history={history}>
                <App />
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.queryByText(/This environment is not a production environment. Do not upload any live data to this service./i)).not.toBeInTheDocument();

            expect(wrapper).toMatchSnapshot();
        });
    });

    it("view instrument page matches Snapshot in non-production environments", async () => {
        const history = createMemoryHistory();
        const wrapper = render(
            <Router history={history}>
                <App />
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(/This environment is not a production environment. Do not upload any live data to this service./i)).toBeDefined();

            expect(wrapper).toMatchSnapshot();
        });
    });

    it("should render correctly", async () => {
        const history = createMemoryHistory();
        const { getByText, queryByText } = render(
            <Router history={history}>
                <App />
            </Router>
        );

        expect(queryByText(/Loading/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(getByText(/Deploy Questionnaire Service/i)).toBeDefined();
            expect(queryByText(/Loading/i)).not.toBeInTheDocument();
        });

        await waitFor(() => {
            expect(getByText(/Deploy Questionnaire Service/i)).toBeDefined();
            expect(getByText(/OPN2007T/i)).toBeDefined();
            expect(queryByText(/Loading/i)).not.toBeInTheDocument();
        });

    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });
});


describe("Given the API returns malformed json", () => {
    beforeAll(() => {
        mock.onGet("/api/instruments").reply(500, { text: "Hello" });
    });

    it("it should render with the error message displayed", async () => {
        const history = createMemoryHistory();
        const { getByText, queryByText } = render(
            <Router history={history}>
                <App />
            </Router>
        );

        expect(queryByText(/Loading/i)).toBeInTheDocument();


        await waitFor(() => {
            expect(getByText(/Sorry, there is a problem with this service. We are working to fix the problem. Please try again later./i)).toBeDefined();
            expect(queryByText(/Loading/i)).not.toBeInTheDocument();
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
    });

    it("it should render with a message to inform the user in the list", async () => {
        const history = createMemoryHistory();
        const { getByText, queryByText } = render(
            <Router history={history}>
                <App />
            </Router>
        );

        expect(queryByText(/Loading/i)).toBeInTheDocument();


        await waitFor(() => {
            expect(getByText(/No installed questionnaires found./i)).toBeDefined();
            expect(queryByText(/Loading/i)).not.toBeInTheDocument();
        });

    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });
});
