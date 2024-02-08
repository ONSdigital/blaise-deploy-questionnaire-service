/**
 * @jest-environment jsdom
 */

import flushPromises from "../tests/utils";
import { questionnaireList } from "../features/step_definitions/helpers/apiMockObjects";
import { render, waitFor, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../app";
import { act } from "react-dom/test-utils";
import React from "react";
import { AuthManager } from "blaise-login-react-client";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const mock = new MockAdapter(axios);

jest.mock("blaise-login-react-client");
AuthManager.prototype.loggedIn = jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
});

describe("Questionnaire Details page ", () => {
    beforeEach(() => {
        mock.onGet("/api/questionnaires").reply(200, questionnaireList);
    });

    afterEach(() => {
        mock.reset();
    });

    it("should redirect to the homepage when no questionnaire has been provided ", async () => {
        //const history = createMemoryHistory();
        // Go direct to the questionnaire details page not from a link
        //history.push("/questionnaire");

        // const history = createMemoryHistory();
        // const route = "/questionnaire";
        // history.push(route);

        render(
            <MemoryRouter>
                <App />
            </MemoryRouter>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(/Filter by questionnaire name/i)).toBeDefined();
            expect(screen.queryByText(/Questionnaire details/i)).toEqual(null);
        });
    });
});
