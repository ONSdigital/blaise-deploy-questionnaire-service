/**
 * @jest-environment jsdom
 */

import flushPromises from "../tests/utils";
import { render, waitFor, screen } from "@testing-library/react";
import { Router } from "react-router-dom";
import { act } from "react-dom/test-utils";
import React from "react";
import { AuthManager } from "blaise-login-react-client";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { createMemoryHistory } from "history";
import QuestionnaireList from "./questionnaireList";

const mock = new MockAdapter(axios);

jest.mock("blaise-login-react-client");
AuthManager.prototype.loggedIn = jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
});

jest.mock("../client/questionnaires");
import { getQuestionnaires } from "../client/questionnaires";
import { Questionnaire } from "blaise-api-node-client";


const getQuestionnairesMock = getQuestionnaires as jest.Mock<Promise<Questionnaire[]>>;

describe("Questionnaire Details page ", () => {
    beforeEach(() => {
        getQuestionnairesMock.mockImplementation(() => Promise.resolve([]));
    });

    afterEach(() => {
        mock.reset();
    });

    it("should redirect to the homepage when no questionnaire has been provided ", async () => {
        const history = createMemoryHistory();
        const route = "/questionnaire";
        history.push(route);
        render(
            <Router location={history.location} navigator={history} >
                <QuestionnaireList setErrored={jest.fn()} />
            </Router >
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
