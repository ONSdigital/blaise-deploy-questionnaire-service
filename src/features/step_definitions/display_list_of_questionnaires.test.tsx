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
    "./src/features/display_list_of_questionnaires.feature",
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

    test("List all questionnaires in Blaise", ({ given, when, then, and }) => {
        given("I have launched the Questionnaire Deployment Service", () => {

        });

        when("I view the landing page", () => {

        });

        then("I am presented with a list of the questionnaires already deployed to Blaise", () => {

        });

        and("it is ordered with the most recently deployed at the top", () => {

        });
    });
});
