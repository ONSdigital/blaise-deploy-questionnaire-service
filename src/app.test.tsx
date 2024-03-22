/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, waitFor, screen } from "@testing-library/react";
import App from "./app";
import "@testing-library/jest-dom";
import flushPromises from "./tests/utils";
import { act } from "react-dom/test-utils";
import { BrowserRouter } from "react-router-dom";
import { questionnaireList } from "./features/step_definitions/helpers/apiMockObjects";
import { Authenticate } from "blaise-login-react/blaise-login-react-client";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const mock = new MockAdapter(axios);

jest.mock("blaise-login-react/blaise-login-react-client");
const { MockAuthenticate } = jest.requireActual("blaise-login-react/blaise-login-react-client");
Authenticate.prototype.render = MockAuthenticate.prototype.render;

const mockIsProduction = jest.fn();

jest.mock("./client/env", () => ({
    isProduction: () => mockIsProduction()
}));

describe("DQS homepage", () => {
    beforeAll(() => {
        mock.onGet("/api/questionnaires").reply(200, questionnaireList);
    });

    afterAll(() => {
        mock.reset();
    });

    beforeEach(() => {
        mockIsProduction.mockReturnValue(false);
        MockAuthenticate.OverrideReturnValues(null, true);
    });

    it("should not show 'not a production environment banner' when in production", async () => {
        mockIsProduction.mockReturnValue(true);
        const wrapper = render(<App />, { wrapper: BrowserRouter });

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.queryByText(/This environment is not a production environment. Do not upload any live data to this service./i)).not.toBeInTheDocument();

            expect(wrapper).toMatchSnapshot();
        });
    });

    it("should show 'not a production environment banner' when not in production", async () => {
        const wrapper = render(<App />, { wrapper: BrowserRouter });

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(/This environment is not a production environment. Do not upload any live data to this service./i)).toBeDefined();

            expect(wrapper).toMatchSnapshot();
        });
    });

    it.only("should render the login page when a user is not signed in", async () => {
        MockAuthenticate.OverrideReturnValues(null, false);

        const { getByText } = render(
            <App />, { wrapper: BrowserRouter }
        );

        await waitFor(() => {
            expect(getByText(/Enter your Blaise username and password/i)).toBeInTheDocument();
        });
    });

    it("should render the homepage when a user is signed in", async () => {
        const { getByText, queryByText } = render(
            <App />, { wrapper: BrowserRouter }
        );

        expect(queryByText(/Loading/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(getByText(/Deploy Questionnaire Service/i)).toBeInTheDocument();
            expect(getByText(/OPN2007T/i)).toBeInTheDocument();
            expect(queryByText(/Loading/i)).not.toBeInTheDocument();
        });
    });
});

describe("Given the API returns malformed json", () => {
    beforeAll(() => {
        mock.onGet("/api/questionnaires").reply(500, { text: "Hello" });
    });

    it("it should render with the error message displayed", async () => {

        const { getByText, queryByText } = render(<App />, { wrapper: BrowserRouter });

        expect(queryByText(/Loading/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(getByText(/Sorry, there is a problem with this service. We are working to fix the problem. Please try again later./i)).toBeDefined();
            expect(queryByText(/Loading/i)).not.toBeInTheDocument();
        });

    });

    afterAll(() => {
        mock.reset();
    });
});

describe("Given the API returns an empty list", () => {
    beforeAll(() => {
        mock.onGet("/api/questionnaires").reply(200, []);
    });

    afterAll(() => {
        mock.reset();
    });

    it("it should render with a message to inform the user in the list", async () => {

        const { getByText, queryByText } = render(<App />, { wrapper: BrowserRouter });

        expect(queryByText(/Loading/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(getByText(/No installed questionnaires found./i)).toBeDefined();
            expect(queryByText(/Loading/i)).not.toBeInTheDocument();
        });

    });
});
