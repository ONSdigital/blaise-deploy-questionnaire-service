// React
import React from "react";
// Test modules
import {defineFeature, loadFeature} from "jest-cucumber";
import {act, cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";
import {createMemoryHistory} from "history";
import App from "../../App";
import {Router} from "react-router";
import "@testing-library/jest-dom";
// Mock elements
import flushPromises from "../../tests/utils";
import {survey_list} from "./API_Mock_Objects";
import navigateToDeployPageAndSelectFile, {mock_fetch_requests} from "./functions";


// Mock the Uploader.js module
jest.mock("../../uploader");


// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/successfully_deploy_a_questionnaire.feature",
    {tagFilter: "not @server and not @integration"}
);

const mock_server_responses = (url: string) => {
    console.log(url);
    if (url.includes("bucket")) {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve({name: "OPN2004A.bpkg"}),
        });
    } else if (url.includes("/api/install")) {
        return Promise.resolve({
            status: 201,
            json: () => Promise.resolve({}),
        });
    } else {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve(survey_list),
        });
    }
};

defineFeature(feature, test => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        jest.resetModules();
    });

    beforeEach(() => {
        cleanup();
        mock_fetch_requests(mock_server_responses);
    });

    test("Successful log in to Questionnaire Deployment Service", ({given, when, then}) => {
        given("I have launched the Questionnaire Deployment Service", () => {
            const history = createMemoryHistory();
            render(
                <Router history={history}>
                    <App/>
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

    test("Select to deploy a new questionnaire", ({given, when, then}) => {
        given("I have selected to deploy a new questionnaire", async () => {
            const history = createMemoryHistory();
            render(
                <Router history={history}>
                    <App/>
                </Router>
            );
            await act(async () => {
                await flushPromises();
            });

            await fireEvent.click(screen.getByText(/Deploy a questionnaire/i));
        });

        when("I am presented with an option to choose a file containing the questionnaire", async () => {
            await waitFor(() => {
                expect(screen.getByText(/Deploy a questionnaire file/i)).toBeDefined();
            });
        });

        then("I am able to select a pre-prepared questionnaire package from a folder/file share", async () => {
            const inputEl = screen.getByLabelText(/Select survey package/i);

            const file = new File(["(⌐□_□)"], "OPN2004A.bpkg", {
                type: "bpkg"
            });

            Object.defineProperty(inputEl, "files", {
                value: [file]
            });

            fireEvent.change(inputEl);
        });
    });


    test("Deploy questionnaire functions disabled", ({given, when, then}) => {
        given("I have selected the questionnaire package I wish to deploy", async () => {
            await navigateToDeployPageAndSelectFile();
        });

        when("I confirm my selection", async () => {
            await fireEvent.click(screen.getByTestId("button"));
        });

        then("I am unable to select another file or continue again until the deployment has finished", () => {
            const inputEl = screen.getByLabelText(/Select survey package/i);
            expect(inputEl.closest("input")).toBeDisabled();
            expect(screen.getByTestId("button")).toBeDisabled();
        });
    });


    test("Deploy selected file", ({given, when, then, and}) => {
        given("I have selected the questionnaire package I wish to deploy", async () => {
            await navigateToDeployPageAndSelectFile();
        });

        when("I confirm my selection", async () => {
            fireEvent.click(screen.getByTestId("button"));
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
