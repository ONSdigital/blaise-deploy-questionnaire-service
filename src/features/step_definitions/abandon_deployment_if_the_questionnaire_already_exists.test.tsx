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
    "./src/features/abandon_deployment_if_the_questionnaire_already_exists.feature",
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

    test("Questionnaire package already in Blaise", ({given, when, then}) => {
        given("I have selected the questionnaire package I wish to deploy", () => {

        });

        when("I confirm my selection and the name/ref of the questionnaire package is the same as one already deployed in Blaise", () => {

        });

        then("I am presented with the options to cancel or overwrite the questionnaire", () => {

        });
    });


    test("Back-out of deploying a questionnaire", ({given, when, then}) => {
        given("I have been presented with the options: Cancel or Overwrite", () => {

        });

        when("I select to 'cancel'", () => {

        });

        then("I am returned to the landing page", () => {

        });
    });


});
