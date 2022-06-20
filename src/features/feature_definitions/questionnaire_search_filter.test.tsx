/**
 * @jest-environment jsdom
 */

// Test modules
import { defineFeature, loadFeature } from "jest-cucumber";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";

import { givenTheQuestionnaireIsInstalled } from "../step_definitions/given";
import { whenILoadTheHomepage, whenISearchForAQuestionnaire } from "../step_definitions/when";
import { thenIAmPresentedWithAListOfDeployedQuestionnaires, thenIAmPresentedWithQuestionnaireNotFound } from "../step_definitions/then";
import { Questionnaire } from "blaise-api-node-client";
import { AuthManager } from "blaise-login-react-client";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

jest.mock("blaise-login-react-client");
AuthManager.prototype.loggedIn = jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
});

// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/questionnaire_search_filter.feature",
    { tagFilter: "not @server and not @integration" }
);


const questionnaireList: Questionnaire[] = [];
const mocker = new MockAdapter(axios);

defineFeature(feature, test => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        cleanup();
        mocker.reset();
    });

    test("Search for a questionnaire", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);

        whenILoadTheHomepage(when);
        whenISearchForAQuestionnaire(when);

        thenIAmPresentedWithAListOfDeployedQuestionnaires(then);
    });

    test("Questionnaire not found", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);

        whenILoadTheHomepage(when);
        whenISearchForAQuestionnaire(when);

        thenIAmPresentedWithQuestionnaireNotFound(then);
    });


    test("DST questionnaires do not show up by default", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);

        whenILoadTheHomepage(when);
        whenISearchForAQuestionnaire(when);

        thenIAmPresentedWithAListOfDeployedQuestionnaires(then);
    });


    test("I can search for DST questinnaires", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);

        whenILoadTheHomepage(when);
        whenISearchForAQuestionnaire(when);

        thenIAmPresentedWithAListOfDeployedQuestionnaires(then);
    });
});
