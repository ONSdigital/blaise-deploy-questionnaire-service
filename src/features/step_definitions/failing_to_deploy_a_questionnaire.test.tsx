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


// Mock the Uploader.js module
jest.mock("../../uploader");


// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/failing_to_deploy_a_questionnaire.feature",
    {tagFilter: "not @server and not @integration"}
);

function mock_server_request(filename: string) {
    global.fetch = jest.fn((url: string) => {
        console.log(url);
        if (url.includes("bucket")) {
            return Promise.resolve({
                status: 200,
                json: () => Promise.resolve({name: filename}),
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
    });
}

defineFeature(feature, test => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        jest.resetModules();
    });

    beforeEach(() => {
        cleanup();
    });

    test("Deployment of selected file failure", ({ given, when, then }) => {
        given("I have selected the questionnaire package I wish to deploy", () => {

        });

        when("I confirm my selection and the questionnaire fails to deploy", () => {

        });

        then("I am presented with an information banner with an error message", () => {

        });
    });

    test("Deploy selected file, retry following failure", ({ given, when, then }) => {
        given("I have selected to deploy a questionnaire package", () => {

        });

        when("the package fails to deploy and I'm presented with a failure message", () => {

        });

        then("I am able to return to the select survey package screen", () => {

        });
    });


});
