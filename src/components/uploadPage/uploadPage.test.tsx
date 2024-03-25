/**
 * @jest-environment jsdom
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import flushPromises from "../../tests/utils";
import { act } from "react-dom/test-utils";
import { BrowserRouter } from "react-router-dom";
import { questionnaireList } from "../../features/step_definitions/helpers/apiMockObjects";
import {
    clickContinue,
    navigatePastSettingTOStartDateAndDeployQuestionnaire, navigateToDeployPageAndSelectFile
} from "../../features/step_definitions/helpers/functions";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import UploadPage from "./uploadPage";
import userEvent from "@testing-library/user-event";

import { Authenticate } from "blaise-login-react/blaise-login-react-client";

// mock login
jest.mock("blaise-login-react/blaise-login-react-client");
const { MockAuthenticate } = jest.requireActual("blaise-login-react/blaise-login-react-client");
Authenticate.prototype.render = MockAuthenticate.prototype.render;
MockAuthenticate.OverrideReturnValues(null, true);

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

describe("Upload Page", () => {
    beforeEach(() => {
        mock.onGet("/api/questionnaires").reply(200, questionnaireList);
    });

    afterEach(() => {
        mock.reset();
    });

    it("select file page matches Snapshot", async () => {

        const wrapper = render(
            <UploadPage />, { wrapper: BrowserRouter }
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
            <UploadPage />, { wrapper: BrowserRouter }
        );

        await waitFor(() => {
            expect(getByText(/Deploy a questionnaire file/i)).toBeDefined();
            expect(getByText(/Select survey package/i)).toBeDefined();
            expect(queryByText(/Table of questionnaires/i)).not.toBeInTheDocument();
        });
    });

    it("should display a message if you dont select a file", async () => {

        render(
            <UploadPage />, { wrapper: BrowserRouter }
        );

        userEvent.click(screen.getByText(/Continue/));

        await waitFor(() => {
            expect(screen.queryAllByText("Select a file")).toHaveLength(2);
        });
    });

    it("should display a message if select a file that is a .bpkg", async () => {

        render(
            <UploadPage />, { wrapper: BrowserRouter }
        );

        const input = screen.getByLabelText(/Select survey package/i);

        const file = new File(["(⌐□_□)"], "OPN2004A.pdf", { type: "application/pdf" });

        userEvent.upload(input, file);

        userEvent.click(screen.getByText(/Continue/));

        await waitFor(() => {
            expect(screen.queryAllByText("File must be a .bpkg")).toHaveLength(2);
        });
    });
});

describe("Given the file fails to upload", () => {
    beforeEach(() => {
        mock.onPut("https://storage.googleapis.com/upload").reply(500,
            {},
        );
        mock.onGet("/upload/init?filename=OPN2004A.bpkg").reply(200, "https://storage.googleapis.com/upload");
        mock.onGet("/upload/verify?filename=OPN2004A.bpkg").reply(200, { name: "OPN2004A.bpkg" });
        mock.onGet("/api/questionnaires").reply(200, questionnaireList);
        mock.onGet("/api/questionnaires/OPN2004A").reply(404);
        mock.onPost("/api/tostartdate/OPN2004A").reply(201);
    });

    afterEach(() => {
        mock.reset();
    });

    it("it should redirect to the summary page with an error", async () => {
        await navigateToDeployPageAndSelectFile();
        await clickContinue();

        await navigatePastSettingTOStartDateAndDeployQuestionnaire();

        await waitFor(() => {
            expect(screen.getByText("File deploy failed")).toBeDefined();
            expect(screen.getByText(/Failed to upload questionnaire/i)).toBeDefined();
        });
    });
});
