// React
import React from "react";
// Test modules
import { defineFeature, loadFeature } from "jest-cucumber";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryHistory } from "history";
import App from "../../App";
import { Router } from "react-router";
import "@testing-library/jest-dom";
// Mock elements
import flushPromises from "../../tests/utils";
import { instrumentList } from "./API_Mock_Objects";
import navigateToDeployPageAndSelectFile, {
    mock_fetch_requests,
    navigatePastSettingTOStartDateAndStartDeployment
} from "./functions";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import userEvent from "@testing-library/user-event";

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/successfully_deploy_a_questionnaire.feature",
    { tagFilter: "not @server and not @integration" }
);

const mock_server_responses = (url: string) => {
    console.log(url);
    if (url.includes("/upload/init")) {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve("https://storage.googleapis.com"),
        });
    } else if (url.includes("/upload/verify")) {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve({ name: "OPN2004A.bpkg" }),
        });
    } else if (url.includes("/api/instruments/OPN2004A/modes")) {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve(["CATI", "CAWI"]),
        });
    } else if (url.includes("/api/instruments/OPN2004A/settings")) {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve([
                {
                    type: "StrictInterviewing",
                    saveSessionOnTimeout: true,
                    saveSessionOnQuit: true,
                    deleteSessionOnTimeout: true,
                    deleteSessionOnQuit: true,
                    sessionTimeout: 15,
                    applyRecordLocking: true
                }
            ]),
        });
    } else if (url.includes("/api/instruments/OPN2004A")) {
        return Promise.resolve({
            status: 404,
            json: () => Promise.resolve({}),
        });
    } else if (url.includes("/api/install")) {
        return Promise.resolve({
            status: 201,
            json: () => Promise.resolve({}),
        });
    } else {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve(instrumentList),
        });
    }
};

defineFeature(feature, test => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        jest.resetModules();
        mock.reset();
    });

    beforeEach(() => {
        mock.onPut(/^https:\/\/storage\.googleapis\.com/).reply(200);
        mock_fetch_requests(mock_server_responses);
    });

    test("Successful log in to Questionnaire Deployment Service", ({ given, when, then }) => {
        given("I have launched the Questionnaire Deployment Service", () => {
            const history = createMemoryHistory();
            render(
                <Router history={history}>
                    <App />
                </Router>
            );
        });

        when("I view the landing page", async () => {
            await act(async () => {
                await flushPromises();
            });
        });

        then("I am presented with an option to deploy a new questionnaire", () => {
            expect(screen.getByText(/Deploy a questionnaire/i)).toBeDefined();
        });
    });

    test("Select to deploy a new questionnaire", ({ given, when, then }) => {
        given("I have selected to deploy a new questionnaire", async () => {
            const history = createMemoryHistory();
            render(
                <Router history={history}>
                    <App />
                </Router>
            );
            await act(async () => {
                await flushPromises();
            });
            userEvent.click(screen.getByText(/Deploy a questionnaire/i));
        });

        when("I am presented with an option to choose a file containing the questionnaire", async () => {
            await waitFor(() => {
                expect(screen.getByText(/Deploy a questionnaire file/i)).toBeDefined();
            });
        });

        then("I am able to select a pre-prepared questionnaire package from a folder/file share", async () => {
            const input = screen.getByLabelText(/Select survey package/i);

            const file = new File(["(⌐□_□)"], "OPN2004A.bpkg", { type: "application/zip" });

            userEvent.upload(input, file);
        });
    });


    test("Deploy questionnaire functions disabled", ({ given, when, then }) => {
        given("I have selected the questionnaire package I wish to deploy", async () => {
            await navigateToDeployPageAndSelectFile();
        });

        when("I confirm my selection", async () => {
            userEvent.click(screen.getByText(/Continue/));
        });

        then("I am unable to select another file or continue again until the deployment has finished", () => {
            const inputEl = screen.getByLabelText(/Select survey package/i);
            expect(inputEl.closest("input")).toBeDisabled();
            expect(screen.getByTestId("button")).toBeDisabled();
        });
    });


    test("Deploy selected file", ({ given, when, then, and }) => {
        given("I have selected the questionnaire package I wish to deploy", async () => {
            await navigateToDeployPageAndSelectFile();
        });

        when("I confirm my selection", async () => {
            fireEvent.click(screen.getByText(/Continue/));

            await navigatePastSettingTOStartDateAndStartDeployment();
        });

        then("the questionnaire package is deployed and populates a SQL database on the Blaise Tel server", async () => {
            await act(async () => {
                await flushPromises();
            });
        });

        and("I am presented with a successful deployment information banner", async () => {
            await waitFor(() => {
                expect(screen.getByText(/The questionnaire file has been successfully deployed and will be displayed within the table of questionnaires./i)).toBeDefined();
            });
        });
    });
});
