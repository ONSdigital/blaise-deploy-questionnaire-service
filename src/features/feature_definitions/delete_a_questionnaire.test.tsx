// React
import React from "react";
// Test modules
import { defineFeature, loadFeature } from "jest-cucumber";
import { cleanup, } from "@testing-library/react";
import "@testing-library/jest-dom";
// Mock elements
import { mock_fetch_requests, mock_builder } from "../step_definitions/helpers/functions";
import { Instrument } from "../../../Interfaces";

import {
    givenTheQuestionnaireIsInstalled,
    givenTheQuestionnaireIsLive
} from "../step_definitions/given";


import {
    thenIAmPresentedWithAWarning,
    thenIAmReturnedToTheLandingPage,
    thenIGetTheDeleteSuccessBanner,
    thenIWillNotHaveTheOptionToDelete,
    thenTheLandingScreenDisplaysAWarningThatLiveSurveysCannotBeDeleted,
    thenTheQuestionnaireDataIsDeleted,
    thenTheQuestionnaireDataIsNotDeleted
} from "../step_definitions/then";
import { whenICancelDelete, whenIConfirmDelete, whenIDeleteAQuestionnaire, whenILoadTheHomepage } from "../step_definitions/when";


// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/delete_a_questionnaire.feature",
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

    test("Delete questionnaire not available from the list, when survey is live", ({ given, when, then, }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mockList);
        givenTheQuestionnaireIsLive(given, instrumentList, mockList);
        mock_fetch_requests(mock_builder(mockList));
        whenILoadTheHomepage(when);
        thenIWillNotHaveTheOptionToDelete(then);
        thenTheLandingScreenDisplaysAWarningThatLiveSurveysCannotBeDeleted(then);
    });


    test("Select to delete a questionnaire from the list, when survey is NOT live", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mockList);
        mock_fetch_requests(mock_builder(mockList));
        whenILoadTheHomepage(when);
        whenIDeleteAQuestionnaire(when);
        thenIAmPresentedWithAWarning(then);
    });

    test("Confirm deletion", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mockList);
        mock_fetch_requests(mock_builder(mockList));
        whenILoadTheHomepage(when);
        whenIDeleteAQuestionnaire(when);
        whenIConfirmDelete(when);
        thenTheQuestionnaireDataIsDeleted(then);
        thenIGetTheDeleteSuccessBanner(then);
    });

    test("Cancel deletion", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mockList);
        mock_fetch_requests(mock_builder(mockList));
        whenILoadTheHomepage(when);
        whenIDeleteAQuestionnaire(when);
        whenICancelDelete(when);
        thenTheQuestionnaireDataIsNotDeleted(then);
        thenIAmReturnedToTheLandingPage(then);
    });
});
