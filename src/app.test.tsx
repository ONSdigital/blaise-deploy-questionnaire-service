/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, waitFor, screen } from "@testing-library/react";
import App from "./app";
import "@testing-library/jest-dom";
import flushPromises from "./tests/utils";
import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom";
import { questionnaireList } from "./features/step_definitions/helpers/apiMockObjects";
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
    beforeAll(() => {
        mock.onGet("/api/questionnaires").reply(200, questionnaireList);
    });

    afterAll(() => {
        mock.reset();
    });

    beforeEach(() => {
        mockIsProduction.mockReturnValue(false);
    });

    it("view questionnaire page matches Snapshot in production", async () => {
        mockIsProduction.mockReturnValue(true);
        const wrapper = render(
            <MemoryRouter initialEntries={["/"]}>
                <App />
            </MemoryRouter>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.queryByText(/This environment is not a production environment. Do not upload any live data to this service./i)).not.toBeInTheDocument();

            expect(wrapper).toMatchSnapshot();
        });
    });

    it("view questionnaire page matches Snapshot in non-production environments", async () => {
        const wrapper = render(
            <MemoryRouter initialEntries={["/"]}>
                <App />
            </MemoryRouter>
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
        const { getByText, queryByText } = render(
            <MemoryRouter initialEntries={["/"]}>
                <App />
            </MemoryRouter>
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
});

describe("Given the API returns malformed json", () => {
    beforeAll(() => {
        mock.onGet("/api/questionnaires").reply(500, { text: "Hello" });
    });

    it("it should render with the error message displayed", async () => {
        const { getByText, queryByText } = render(
            <MemoryRouter initialEntries={["/"]}>
                <App />
            </MemoryRouter>
        );

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
        const { getByText, queryByText } = render(
            <MemoryRouter initialEntries={["/"]}>
                <App />
            </MemoryRouter>
        );

        expect(queryByText(/Loading/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(getByText(/No installed questionnaires found./i)).toBeDefined();
            expect(queryByText(/Loading/i)).not.toBeInTheDocument();
        });

    });
});
