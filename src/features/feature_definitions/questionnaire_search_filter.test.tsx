// Test modules
import { defineFeature, loadFeature } from "jest-cucumber";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
// Mock elements
import { givenTheQuestionnaireIsInstalled } from "../step_definitions/given";
import { whenILoadTheHomepage, whenISearchForAQuestionnaire } from "../step_definitions/when";
import { mock_builder, mock_fetch_requests } from "../step_definitions/helpers/functions";
import { thenIAmPresentedWithAListOfDeployedQuestionnaires, thenIAmPresentedWithQuestionnaireNotFound } from "../step_definitions/then";
import { Instrument } from "../../../Interfaces";

// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/questionnaire_search_filter.feature",
    { tagFilter: "not @server and not @integration" }
);


const instrumentList: Instrument[] = [];
const mockList: Record<string, Promise<any>> = {};

defineFeature(feature, test => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        jest.resetModules();
    });

    beforeEach(() => {
        cleanup();
    });

    test("Search for a questionnaire", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mockList);
        givenTheQuestionnaireIsInstalled(given, instrumentList, mockList);
        givenTheQuestionnaireIsInstalled(given, instrumentList, mockList);
        givenTheQuestionnaireIsInstalled(given, instrumentList, mockList);
        givenTheQuestionnaireIsInstalled(given, instrumentList, mockList);
        givenTheQuestionnaireIsInstalled(given, instrumentList, mockList);

        mock_fetch_requests(mock_builder(mockList));

        whenILoadTheHomepage(when);
        whenISearchForAQuestionnaire(when);

        thenIAmPresentedWithAListOfDeployedQuestionnaires(then);
    });

    test("Questionnaire not found", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mockList);

        mock_fetch_requests(mock_builder(mockList));

        whenILoadTheHomepage(when);
        whenISearchForAQuestionnaire(when);

        thenIAmPresentedWithQuestionnaireNotFound(then);
    });
});
