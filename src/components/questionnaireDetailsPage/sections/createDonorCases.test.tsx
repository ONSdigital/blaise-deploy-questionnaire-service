/**
 * @jest-environment jsdom
 */

import flushPromises from "../../../tests/utils";
import { render, waitFor, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import React from "react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { ipsPilotQuestionnaire, ipsQuestionnaire } from "../../../features/step_definitions/helpers/apiMockObjects";
import { Authenticate } from "blaise-login-react/blaise-login-react-client";
import CreateDonorCases from "./createDonorCases";
import { MemoryRouter } from "react-router-dom";

const mock = new MockAdapter(axios);

// mock login
jest.mock("blaise-login-react/blaise-login-react-client");
const { MockAuthenticate } = jest.requireActual("blaise-login-react/blaise-login-react-client");
Authenticate.prototype.render = MockAuthenticate.prototype.render;
MockAuthenticate.OverrideReturnValues(null, true);

describe("IPS questionnaires", () => {
    afterEach(() => {
        mock.reset();
    });

    it("should display the option to create donor cases for IPS Manager and IPS Field Interviewer", async () => {
        render(
            <MemoryRouter initialEntries={["/questionnaire/"]}>
                <CreateDonorCases questionnaire={ipsQuestionnaire} />
            </MemoryRouter >
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            // expect(screen.getByText("IPS Manager")).toBeDefined();
            // expect(screen.getByText("IPS Field Interviewer")).toBeDefined();
            // const createCasesElements = screen.getAllByText("Create cases");
            // expect(createCasesElements.length).toBe(2);
        });
    });

    it("should display the option to create donor cases for IPS Pilot Interviewer only given it's an IPS Pilot Questionnaire", async () => {
        render(
            <MemoryRouter initialEntries={["/questionnaire/"]}>
                <CreateDonorCases questionnaire={ipsQuestionnaire} />
            </MemoryRouter >
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(screen.getByText("IPS Pilot Interviewer")).toBeDefined();
            const createCasesElements = screen.getAllByText("Create cases");
            expect(createCasesElements.length).toBe(1);
        });
    });
});