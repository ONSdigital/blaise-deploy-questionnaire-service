/**
 * @jest-environment jsdom
 */

import flushPromises from "../tests/utils";
import { render, waitFor, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { act } from "react-dom/test-utils";
import React from "react";
import { Authenticate } from "blaise-login-react/blaise-login-react-client";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import QuestionnaireList from "./questionnaireList";

const mock = new MockAdapter(axios);

// mock login
jest.mock("blaise-login-react/blaise-login-react-client");
const { MockAuthenticate } = jest.requireActual("blaise-login-react/blaise-login-react-client");
Authenticate.prototype.render = MockAuthenticate.prototype.render;
MockAuthenticate.OverrideReturnValues(null, true);

describe("Questionnaire Details page ", () => {
    beforeEach(() => {
        mock.onGet("/api/questionnaires").reply(200, []);
    });

    afterEach(() => {
        mock.reset();
    });

    it("should redirect to the homepage when no questionnaire has been provided ", async () => {

        // Go direct to the questionnaire details page not from a link
        render(
            <MemoryRouter initialEntries={["/questionnaire/"]}>
                <QuestionnaireList setErrored={jest.fn()} />
            </MemoryRouter >
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.queryByText("Questionnaire settings")).toEqual(null);
            expect(screen.getByText(/Filter by questionnaire name/i)).toBeDefined();
            expect(screen.queryByText(/Questionnaire details/i)).toEqual(null);
        });
    });
});
