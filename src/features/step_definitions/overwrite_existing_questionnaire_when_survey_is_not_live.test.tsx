// React
import React from "react";
// Test modules
import {defineFeature, loadFeature} from "jest-cucumber";
import {cleanup, fireEvent, screen, waitFor} from "@testing-library/react";
import "@testing-library/jest-dom";
// Mock elements
import {survey_list} from "./API_Mock_Objects";
import navigateToDeployPageAndSelectFile, {mock_fetch_requests} from "./functions";


// Mock the Uploader.js module
jest.mock("../../uploader");


// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/overwrite_existing_questionnaire_when_survey_is_not_live.feature",
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
            status: 500,
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
    });

    test("Select a new questionnaire package file", ({given, when, then}) => {
        given("I have selected the questionnaire package I wish to deploy", () => {

        });

        when("I confirm my selection and the name/ref of the questionnaire package is the same as one already deployed in Blaise", () => {

        });

        then("I am presented with the options to cancel or overwrite the questionnaire", () => {

        });
    });


    test("Select to overwrite existing questionnaire when it is live", ({given, when, then, and}) => {
        given("I have been presented with the options to cancel or overwrite the questionnaire", () => {

        });

        when("I select to 'overwrite' and the survey is live (within the specified survey days)", () => {

        });

        then("I am presented with a warning banner that I cannot overwrite the survey", () => {

        });

        and("can only return to the landing page", () => {

        });
    });


    test("Select to overwrite existing questionnaire where no data exists (the questionnaire has been deployed but the sample data has not yet been deployed)", ({
                                                                                                                                                                     given,
                                                                                                                                                                     when,
                                                                                                                                                                     then
                                                                                                                                                                 }) => {
        given("I have been presented with the options to cancel or overwrite the questionnaire", () => {

        });

        when("I select to 'overwrite' and there is no sample or respondent data captured for the questionnaire", () => {

        });

        then("I am presented with a warning, to confirm overwrite", () => {

        });
    });


    test("Confirm overwrite of existing questionnaire package where no data exists (the questionnaire has been deployed but the sample data has not yet been deployed)", ({
                                                                                                                                                                              given,
                                                                                                                                                                              when,
                                                                                                                                                                              then,
                                                                                                                                                                              and
                                                                                                                                                                          }) => {
        given("I have been asked to confirm I want to overwrite an existing questionnaire in Blaise", () => {

        });

        when("I confirm I want to do this", () => {

        });

        then("the questionnaire package is deployed and overwrites the existing questionnaire in the SQL database on the Blaise Tel server", () => {

        });

        and("I am presented with a successful deployment banner on the landing page", () => {

        });
    });


    test("Cancel overwrite of existing questionnaire package", ({given, when, then}) => {
        given("I have been presented with an overwrite warning", () => {

        });

        when("I confirm that I do NOT want to continue", () => {

        });

        then("I am returned to the landing page", () => {

        });
    });


});
