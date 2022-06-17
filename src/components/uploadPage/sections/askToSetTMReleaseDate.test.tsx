/**
 * @jest-environment jsdom
 */

import navigateToDeployPageAndSelectFile from "../../../features/step_definitions/helpers/functions";
import {act, screen} from "@testing-library/react";
import flushPromises from "../../../tests/utils";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import '@testing-library/jest-dom/extend-expect';

const mock = new MockAdapter(axios);

import { AuthManager } from "blaise-login-react-client";
import React from "react";

jest.mock("blaise-login-react-client");
AuthManager.prototype.loggedIn = jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
});

describe("Ask to set TM release date page", () => {
    const LMSQuestionnaire = "LMS2004A.bpkg"
    const OPNQuestionnaire = "OPN2004A.bpkg"

    it("should render when an LMS questionnaire is being deployed", async () => {
        await deployQuestionnaireAndSetNoTOStartDate(LMSQuestionnaire);

        expect(screen.getByText(/Would you like to set a Totalmobile release date for questionnaire/i)).toBeDefined();
        expect(screen.queryByText(/Deployment summary/i)).not.toBeInTheDocument();
    });

    it("should not render when a non-LMS questionnaire is being deployed", async () => {
        await deployQuestionnaireAndSetNoTOStartDate(OPNQuestionnaire);

        expect(screen.queryByText(/Would you like to set a Totalmobile release date for questionnaire/i)).not.toBeInTheDocument();
        expect(screen.getByText(/Deployment summary/i)).toBeDefined();
    });

    it("should continue to deploy questionnaire if no release date has been selected", async () => {
        await deployQuestionnaireAndSetNoTOStartDate(LMSQuestionnaire);
        await selectNoReleaseDate();

        expect(screen.getByText(/Deployment summary/i)).toBeDefined();
    });
});

async function deployQuestionnaireAndSetNoTOStartDate(questionnaire: string): Promise<void> {
    // Deploy page
    await navigateToDeployPageAndSelectFile(questionnaire);
    userEvent.click(screen.getByText(/Continue/));
    await act(async () => {
        await flushPromises();
    });

    // TO start date page
    userEvent.click(screen.getByText(/No start date/i));
    userEvent.click(screen.getByText(/Continue/));
    await act(async () => {
        await flushPromises();
    });
}

async function selectNoReleaseDate(): Promise<void> {
    userEvent.click(screen.getByText(/No release date/i));
    userEvent.click(screen.getByText(/Continue/));
    await act(async () => {
        await flushPromises();
    });
}
