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
import { Instrument } from "../../../Interfaces";
import { Mocker } from "../step_definitions/helpers/mocker";
import {AuthManager} from "blaise-login-react-client";

jest.mock("blaise-login-react-client");
AuthManager.prototype.loggedIn = jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
});

// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/questionnaire_search_filter.feature",
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

    test("Search for a questionnaire", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mocker);
        givenTheQuestionnaireIsInstalled(given, instrumentList, mocker);
        givenTheQuestionnaireIsInstalled(given, instrumentList, mocker);
        givenTheQuestionnaireIsInstalled(given, instrumentList, mocker);
        givenTheQuestionnaireIsInstalled(given, instrumentList, mocker);
        givenTheQuestionnaireIsInstalled(given, instrumentList, mocker);

        whenILoadTheHomepage(when);
        whenISearchForAQuestionnaire(when);

        thenIAmPresentedWithAListOfDeployedQuestionnaires(then);
    });

    test("Questionnaire not found", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mocker);

        whenILoadTheHomepage(when);
        whenISearchForAQuestionnaire(when);

        thenIAmPresentedWithQuestionnaireNotFound(then);
    });
});
