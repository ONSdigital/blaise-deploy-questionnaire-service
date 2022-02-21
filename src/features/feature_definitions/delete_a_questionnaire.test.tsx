/**
 * @jest-environment jsdom
 */

// Test modules
import { defineFeature, loadFeature } from "jest-cucumber";
import { cleanup, } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Instrument } from "blaise-api-node-client";

import {
    givenTheQuestionnaireHasActiveSurveyDays,
    givenTheQuestionnaireIsInactive,
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
import {
    whenICancelDelete,
    whenIConfirmDelete,
    whenIDeleteAQuestionnaire,
    whenILoadTheHomepage
} from "../step_definitions/when";
import { Mocker } from "../step_definitions/helpers/mocker";
import { AuthManager } from "blaise-login-react-client";

jest.mock("blaise-login-react-client");
AuthManager.prototype.loggedIn = jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
});

// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/delete_a_questionnaire.feature",
    { tagFilter: "not @server and not @integration" }
);


const instrumentList: Instrument[] = [];
const mocker = new Mocker();


defineFeature(feature, test => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        jest.resetModules();
    });

    beforeEach(() => {
        cleanup();
    });

    test("Delete an 'inactive' survey at any time", ({ given, when, then, }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mocker);
        givenTheQuestionnaireIsInactive(given, instrumentList, mocker);
        givenTheQuestionnaireHasActiveSurveyDays(given, instrumentList, mocker);
        whenILoadTheHomepage(when);
        whenIDeleteAQuestionnaire(when);
        whenIConfirmDelete(when);
        thenTheQuestionnaireDataIsDeleted(then);
    });

    test("Delete questionnaire not available from the list, when survey is live", ({ given, when, then, }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mocker);
        givenTheQuestionnaireIsLive(given, instrumentList, mocker);
        whenILoadTheHomepage(when);
        thenIWillNotHaveTheOptionToDelete(then);
        thenTheLandingScreenDisplaysAWarningThatLiveSurveysCannotBeDeleted(then);
    });


    test("Select to delete a questionnaire from the list, when survey is NOT live", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mocker);
        whenILoadTheHomepage(when);
        whenIDeleteAQuestionnaire(when);
        thenIAmPresentedWithAWarning(then);
    });

    test("Confirm deletion", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mocker);
        whenILoadTheHomepage(when);
        whenIDeleteAQuestionnaire(when);
        whenIConfirmDelete(when);
        thenTheQuestionnaireDataIsDeleted(then);
        thenIGetTheDeleteSuccessBanner(then);
    });

    test("Cancel deletion", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mocker);
        whenILoadTheHomepage(when);
        whenIDeleteAQuestionnaire(when);
        whenICancelDelete(when);
        thenTheQuestionnaireDataIsNotDeleted(then);
        thenIAmReturnedToTheLandingPage(then);
    });
});
