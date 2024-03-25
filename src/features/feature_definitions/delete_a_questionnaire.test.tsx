/**
 * @jest-environment jsdom
 */

// Test modules
import { defineFeature, loadFeature } from "jest-cucumber";
import "@testing-library/jest-dom";
import { Questionnaire } from "blaise-api-node-client";

import {
    givenTheQuestionnaireHasActiveSurveyDays,
    givenTheQuestionnaireHasModes,
    givenTheQuestionnaireIsActive,
    givenTheQuestionnaireIsInactive,
    givenTheQuestionnaireIsInstalled,
} from "../step_definitions/given";

import {
    thenIAmPresentedWithAnActiveSurveyDaysWarning,
    thenIAmPresentedWithAnActiveWebCollectionWarning,
    thenIAmPresentedWithAWarning,
    thenIAmReturnedToTheQuestionnaireDetailsPage,
    thenIGetTheDeleteSuccessBanner,
    thenIWillNotHaveTheOptionToDelete,
    thenTheQuestionnaireDataIsDeleted,
    thenTheQuestionnaireDataIsNotDeleted
} from "../step_definitions/then";
import {
    whenICancelDelete,
    whenIConfirmDelete,
    whenIDeleteAQuestionnaire,
    whenIGoToTheQuestionnaireDetailsPage,
    whenILoadTheHomepage
} from "../step_definitions/when";
import { Authenticate, AuthManager } from "blaise-login-react/blaise-login-react-client";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

// mock login
jest.mock("blaise-login-react/blaise-login-react-client");
const { MockAuthenticate } = jest.requireActual("blaise-login-react/blaise-login-react-client");
Authenticate.prototype.render = MockAuthenticate.prototype.render;
MockAuthenticate.OverrideReturnValues(null, true);

// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/delete_a_questionnaire.feature",
    { tagFilter: "not @server and not @integration" }
);

const questionnaireList: Questionnaire[] = [];
const mocker = new MockAdapter(axios);

defineFeature(feature, test => {
    afterEach(() => {
        mocker.reset();
    });

    test("Delete an 'inactive' survey at any time", ({ given, when, then, }) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireIsInactive(given, questionnaireList, mocker);
        givenTheQuestionnaireHasActiveSurveyDays(given, questionnaireList, mocker);
        whenIGoToTheQuestionnaireDetailsPage(when);
        whenIDeleteAQuestionnaire(when);
        whenIConfirmDelete(when);
        thenTheQuestionnaireDataIsDeleted(then, mocker);
        thenIGetTheDeleteSuccessBanner(then);
    });

    test("Delete a questionnaire not available from the homepage", ({ given, when, then, }) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        whenILoadTheHomepage(when);
        thenIWillNotHaveTheOptionToDelete(then);
    });

    test("Confirm deletion", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        whenIGoToTheQuestionnaireDetailsPage(when);
        whenIDeleteAQuestionnaire(when);
        whenIConfirmDelete(when);
        thenTheQuestionnaireDataIsDeleted(then, mocker);
        thenIGetTheDeleteSuccessBanner(then);
    });

    test("Cancel deletion", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        whenIGoToTheQuestionnaireDetailsPage(when);
        whenIDeleteAQuestionnaire(when);
        whenICancelDelete(when);
        thenTheQuestionnaireDataIsNotDeleted(then, mocker);
        thenIAmReturnedToTheQuestionnaireDetailsPage(then);
    });

    test("Select to delete questionnaire that is active and live", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireIsActive(given, questionnaireList, mocker);
        givenTheQuestionnaireHasActiveSurveyDays(given, questionnaireList, mocker);
        whenIGoToTheQuestionnaireDetailsPage(when);
        whenIDeleteAQuestionnaire(when);
        thenIAmPresentedWithAnActiveSurveyDaysWarning(then);
        whenIConfirmDelete(when);
        thenTheQuestionnaireDataIsDeleted(then, mocker);
        thenIGetTheDeleteSuccessBanner(then);
    });

    test("Select to delete questionnaire that is active and not live", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireHasActiveSurveyDays(given, questionnaireList, mocker);
        whenIGoToTheQuestionnaireDetailsPage(when);
        whenIDeleteAQuestionnaire(when);
        thenIAmPresentedWithAWarning(then);
        whenIConfirmDelete(when);
        thenTheQuestionnaireDataIsDeleted(then, mocker);
        thenIGetTheDeleteSuccessBanner(then);
    });

    test("Select to delete questionnaire that is inactive", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireIsInactive(given, questionnaireList, mocker);
        whenIGoToTheQuestionnaireDetailsPage(when);
        whenIDeleteAQuestionnaire(when);
        whenIConfirmDelete(when);
        thenTheQuestionnaireDataIsDeleted(then, mocker);
        thenIGetTheDeleteSuccessBanner(then);
    });

    test("Select to delete questionnaire that is active and has mode set to CAWI", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireIsActive(given, questionnaireList, mocker);
        givenTheQuestionnaireHasModes(given, mocker);
        whenIGoToTheQuestionnaireDetailsPage(when);
        whenIDeleteAQuestionnaire(when);
        thenIAmPresentedWithAnActiveWebCollectionWarning(then);
        whenIConfirmDelete(when);
        thenTheQuestionnaireDataIsDeleted(then, mocker);
        thenIGetTheDeleteSuccessBanner(then);
    });
});
