/**
 * @jest-environment jsdom
 */

// Test modules
import { defineFeature, loadFeature } from "jest-cucumber";
import "@testing-library/jest-dom";
// Mock elements
import { Questionnaire } from "blaise-api-node-client";

import { givenTheQuestionnaireCannotBeDeletedBecauseItWillGoErroneous, givenTheQuestionnaireIsErroneous, givenTheQuestionnaireIsInstalled } from "../step_definitions/given";
import { whenIConfirmDelete, whenIDeleteAQuestionnaire, whenIGoToTheQuestionnaireDetailsPage } from "../step_definitions/when";
import { thenIAmPresentedWithACannotDeleteWarning, thenIAmPresentedWithAUnableDeleteWarning, thenIAmUnableToDeleteTheQuestionnaire, thenICanReturnToTheQuestionnaireList } from "../step_definitions/then";
import { Authenticate } from "blaise-login-react-client";
import axios from "axios";
import Mockadapter from "axios-mock-adapter";

// mock login
jest.mock("blaise-login-react-client");
const { MockAuthenticate } = jest.requireActual('blaise-login-react-client');
Authenticate.prototype.render = MockAuthenticate.prototype.render;
MockAuthenticate.OverrideReturnValues(null, true);

// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/erroneous_delete_questionnaire.feature",
    { tagFilter: "not @server and not @integration" }
);

const questionnaireList: Questionnaire[] = [];
const mocker = new Mockadapter(axios);

defineFeature(feature, test => {
    afterEach(() => {
        mocker.reset();
    });

    test("Attempt to delete an questionnaire with an erroneous status", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireIsErroneous(given, questionnaireList);
        whenIGoToTheQuestionnaireDetailsPage(when);
        whenIDeleteAQuestionnaire(when);
        thenIAmPresentedWithAUnableDeleteWarning(then);
        thenIAmUnableToDeleteTheQuestionnaire(then);
        thenICanReturnToTheQuestionnaireList(then);
    });

    test("Select to deploy a new questionnaire", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireCannotBeDeletedBecauseItWillGoErroneous(when, mocker);
        whenIGoToTheQuestionnaireDetailsPage(when);
        whenIDeleteAQuestionnaire(when);
        whenIConfirmDelete(when);
        thenIAmPresentedWithACannotDeleteWarning(then);
    });
});
