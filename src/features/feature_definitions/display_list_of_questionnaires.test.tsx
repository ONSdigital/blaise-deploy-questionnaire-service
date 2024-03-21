/**
 * @jest-environment jsdom
 */

// Test modules
import { defineFeature, loadFeature } from "jest-cucumber";
import "@testing-library/jest-dom";
// Mock elements
import { Questionnaire } from "blaise-api-node-client";

import { givenTheQuestionnaireIsInstalled } from "../step_definitions/given";
import { whenILoadTheHomepage } from "../step_definitions/when";
import { thenIAmPresentedWithAListOfDeployedQuestionnaires } from "../step_definitions/then";
import { Authenticate } from "blaise-login-react/blaise-login-react-client";
import axios from "axios";
import MockAdapeter from "axios-mock-adapter";

// mock login
jest.mock("blaise-login-react/blaise-login-react-client");
const { MockAuthenticate } = jest.requireActual("blaise-login-react/blaise-login-react-client");
Authenticate.prototype.render = MockAuthenticate.prototype.render;
MockAuthenticate.OverrideReturnValues(null, true);

// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/display_list_of_questionnaires.feature",
    { tagFilter: "not @server and not @integration" }
);

const questionnaireList: Questionnaire[] = [];
const mocker = new MockAdapeter(axios);

defineFeature(feature, test => {
    afterEach(() => {
        mocker.reset();
    });

    test("List all questionnaires in Blaise", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        whenILoadTheHomepage(when);
        thenIAmPresentedWithAListOfDeployedQuestionnaires(then);
    });
});
