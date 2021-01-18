// React
import React from "react";
// Test modules
import {defineFeature, loadFeature} from "jest-cucumber";
import {act, cleanup, fireEvent, screen, waitFor} from "@testing-library/react";
import "@testing-library/jest-dom";
// Mock elements
import {survey_list} from "./API_Mock_Objects";
import navigateToDeployPageAndSelectFile, {mock_fetch_requests} from "./functions";
import flushPromises from "../../tests/utils";

// Mock the Uploader.js module
jest.mock("../../uploader");


// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/overwrite_existing_questionnaire_when_survey_is_not_live.feature",
    {tagFilter: "not @server and not @integration"}
);

const mock_server_responses_not_live = (url: string) => {
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
    } else if (url.includes("exists")) {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve(true),
        });
    } else if (url.includes("instruments")) {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve({hasData: false}),
        });
    } else {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve(survey_list),
        });
    }
};

const mock_server_responses_live = (url: string) => {
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
    } else if (url.includes("exists")) {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve(true),
        });
    } else if (url.includes("instruments")) {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve({hasData: true}),
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
        given("I have selected the questionnaire package I wish to deploy", async () => {
            mock_fetch_requests(mock_server_responses_not_live);
            await navigateToDeployPageAndSelectFile();
        });

        when("I confirm my selection and the name/ref of the questionnaire package is the same as one already deployed in Blaise", async () => {
            await fireEvent.click(screen.getByTestId("button"));
        });

        then("I am presented with the options to cancel or overwrite the questionnaire", async () => {
            await waitFor((() => {
                expect(screen.getByText(/already exists in the system/i)).toBeDefined();
                expect(screen.getByText("Overwrite the entire questionnaire")).toBeDefined();
            }));
        });
    });


    test("Select to overwrite existing questionnaire when it is live", ({given, when, then, and}) => {
        given("I have been presented with the options to cancel or overwrite the questionnaire", async () => {
            mock_fetch_requests(mock_server_responses_live);
            await navigateToDeployPageAndSelectFile();
            await fireEvent.click(screen.getByTestId("button"));
        });

        when("I select to 'overwrite' and the survey is live (within the specified survey days)", async () => {
            await fireEvent.click(screen.getByText(/overwrite the entire questionnaire/i));
            await fireEvent.click(screen.getByText(/save/i));
        });

        then("I am presented with a warning banner that I cannot overwrite the survey", async () => {
            await waitFor((() => {
                expect(screen.getByText(/you cannot overwrite questionnaire that are currently live/i));
            }));
        });

        and("can only return to the landing page", async () => {
            await waitFor((() => {
                expect(screen.getByText(/accept and go to table of questionnaires/i));
            }));
        });
    });


    test("Select to overwrite existing questionnaire where no data exists (the questionnaire has been deployed but the sample data has not yet been deployed)", ({
                                                                                                                                                                     given,
                                                                                                                                                                     when,
                                                                                                                                                                     then
                                                                                                                                                                 }) => {
        given("I have been presented with the options to cancel or overwrite the questionnaire", async () => {
            mock_fetch_requests(mock_server_responses_not_live);
            await navigateToDeployPageAndSelectFile();
            await fireEvent.click(screen.getByTestId("button"));
        });

        when("I select to 'overwrite' and there is no sample or respondent data captured for the questionnaire", async () => {
            await fireEvent.click(screen.getByText(/overwrite the entire questionnaire/i));
            await fireEvent.click(screen.getByText(/save/i));
        });

        then("I am presented with a warning, to confirm overwrite", async () => {
            await waitFor((() => {
                expect(screen.getByText(/are you sure you want to overwrite the entire questionnaire/i));
            }));
        });
    });


    test("Confirm overwrite of existing questionnaire package where no data exists (the questionnaire has been deployed but the sample data has not yet been deployed)", ({
                                                                                                                                                                              given,
                                                                                                                                                                              when,
                                                                                                                                                                              then,
                                                                                                                                                                              and
                                                                                                                                                                          }) => {
        given("I have been asked to confirm I want to overwrite an existing questionnaire in Blaise", async () => {
            mock_fetch_requests(mock_server_responses_not_live);
            await navigateToDeployPageAndSelectFile();
            await fireEvent.click(screen.getByTestId("button"));
            await act(async () => {
                await flushPromises();
            });
            await fireEvent.click(screen.getByText(/overwrite the entire questionnaire/i));
            await fireEvent.click(screen.getByText(/save/i));
        });

        when("I confirm I want to do this", async () => {
            await fireEvent.click(screen.getByText(/yes, overwrite questionnaire/i));
            await fireEvent.click(screen.getByText(/continue/i));
        });

        then("the questionnaire package is deployed and overwrites the existing questionnaire in the SQL database on the Blaise Tel server", () => {

        });

        and("I am presented with a successful deployment banner on the landing page", async () => {
            await waitFor(() => {
                expect(screen.getByText(/The questionnaire file has been successfully deployed and will be displayed within the table of questionnaires./i)).toBeDefined();
            });
        });
    });


    test("Cancel overwrite of existing questionnaire package", ({given, when, then}) => {
        given("I have been presented with an overwrite warning", async () => {
            mock_fetch_requests(mock_server_responses_not_live);
            await navigateToDeployPageAndSelectFile();
            await fireEvent.click(screen.getByTestId("button"));
            await act(async () => {
                await flushPromises();
            });
            await fireEvent.click(screen.getByText(/overwrite the entire questionnaire/i));
            await fireEvent.click(screen.getByText(/save/i));
        });

        when("I confirm that I do NOT want to continue", async () => {
            await fireEvent.click(screen.getByText(/no, do not overwrite questionnaire/i));
            await fireEvent.click(screen.getByText(/continue/i));
        });

        then("I am returned to the landing page", async () => {
            await waitFor(() => {
                expect(screen.getByText(/table of questionnaires/i)).toBeDefined();
            });
        });
    });
});
