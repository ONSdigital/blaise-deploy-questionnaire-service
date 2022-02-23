/**
 * @jest-environment jsdom
 */

import flushPromises, { mock_server_request_Return_JSON } from "../../tests/utils";
import { instrumentList } from "../../features/step_definitions/helpers/API_Mock_Objects";
import { createMemoryHistory } from "history";
import { render, waitFor, screen } from "@testing-library/react";
import { Router } from "react-router";
import App from "../../App";
import { act } from "react-dom/test-utils";
import React from "react";
import { AuthManager } from "blaise-login-react-client";

jest.mock("blaise-login-react-client");
AuthManager.prototype.loggedIn = jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
});


describe("Instrument Details page ", () => {

    beforeAll(() => {
        mock_server_request_Return_JSON(200, instrumentList);
    });

    it("should redirect to the homepage when no instrument has been provided ", async () => {
        const history = createMemoryHistory();
        // Go direct to the questionnaire details page not from a link
        history.push("/questionnaire");
        render(
            <Router history={history}>
                <App />
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText(/Table of questionnaires/i)).toBeDefined();
            expect(screen.queryByText(/Questionnaire details/i)).toEqual(null);
        });
    });
});
