// React
import React from "react";
// Test modules
import { defineFeature, loadFeature } from "jest-cucumber";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
// Mock elements
import { mock_fetch_requests, mock_builder } from "../step_definitions/helpers/functions";
import { Instrument } from "../../../Interfaces";

import { givenTheQuestionnaireIsInstalled } from "../step_definitions/given";
import { whenILoadTheHomepage } from "../step_definitions/when";
import { thenIAmPresentedWithAListOfDeployedQuestionnaires } from "../step_definitions/then";


// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/display_list_of_questionnaires.feature",
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

    test("List all questionnaires in Blaise", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mockList);
        givenTheQuestionnaireIsInstalled(given, instrumentList, mockList);
        givenTheQuestionnaireIsInstalled(given, instrumentList, mockList);
        mock_fetch_requests(mock_builder(mockList));
        whenILoadTheHomepage(when);
        thenIAmPresentedWithAListOfDeployedQuestionnaires(then);
    });
});
