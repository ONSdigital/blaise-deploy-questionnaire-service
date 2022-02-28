/**
 * @jest-environment jsdom
 */

import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import flushPromises from "../../tests/utils";
import { act } from "react-dom/test-utils";
import { createMemoryHistory } from "history";
import { Router } from "react-router";
import { instrumentList } from "../../features/step_definitions/helpers/apiMockObjects";
import navigateToDeployPageAndSelectFile, {
    navigatePastSettingTOStartDateAndStartDeployment
} from "../../features/step_definitions/helpers/functions";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import UploadPage from "./uploadPage";
import userEvent from "@testing-library/user-event";

import { AuthManager } from "blaise-login-react-client";

jest.mock("blaise-login-react-client");
AuthManager.prototype.loggedIn = jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
});

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

describe("Upload Page", () => {
    beforeEach(() => {
        mock.onGet("/api/instruments").reply(200, instrumentList);
    });

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });

    it("select file page matches Snapshot", async () => {
        const history = createMemoryHistory();
        const wrapper = render(
            <Router history={history}>
                <UploadPage />
            </Router>
        );

        await act(async () => {
            await flushPromises();
        });

        await waitFor(() => {
            expect(wrapper).toMatchSnapshot();
        });
    });

    it("should render correctly", async () => {
        const history = createMemoryHistory();
        const { getByText, queryByText } = render(
            <Router history={history}>
                <UploadPage />
            </Router>
        );

        await waitFor(() => {
            expect(getByText(/Deploy a questionnaire file/i)).toBeDefined();
            expect(getByText(/Select survey package/i)).toBeDefined();
            expect(queryByText(/Table of questionnaires/i)).not.toBeInTheDocument();
        });
    });

    it("should display a message if you dont select a file", async () => {
        const history = createMemoryHistory();
        render(
            <Router history={history}>
                <UploadPage />
            </Router>
        );

        userEvent.click(screen.getByText(/Continue/));

        await waitFor(() => {
            expect(screen.queryAllByText("Select a file")).toHaveLength(2);
        });
    });

    it("should display a message if select a file that is a .bpkg", async () => {
        const history = createMemoryHistory();
        render(
            <Router history={history}>
                <UploadPage />
            </Router>
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
        mock.onGet("/api/instruments").reply(200, instrumentList);
        mock.onGet("/api/instruments/OPN2004A").reply(404);
        mock.onPost("/api/tostartdate/OPN2004A").reply(201);
    });

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        mock.reset();
    });

    it("it should redirect to the summary page with an error", async () => {
        await navigateToDeployPageAndSelectFile();

        userEvent.click(screen.getByText(/Continue/));

        await navigatePastSettingTOStartDateAndStartDeployment();

        await waitFor(() => {
            expect(screen.getByText("File deploy failed")).toBeDefined();
            expect(screen.getByText(/Failed to upload questionnaire/i)).toBeDefined();
        });
    });
});
