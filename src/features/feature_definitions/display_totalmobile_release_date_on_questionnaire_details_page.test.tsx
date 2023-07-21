/**
 * @jest-environment jsdom
 */

// Test modules
import { defineFeature, loadFeature } from "jest-cucumber";
import "@testing-library/jest-dom";
// Mock elements
import { IQuestionnaire } from "blaise-api-node-client";

import {
    givenTheQuestionnaireIsInstalled,
    givenTheQuestionnaireHasATotalmobileReleaseDate,
    givenTheQuestionnaireDoesNotHaveATotalmobileReleaseDate
} from "../step_definitions/given";
import {
    whenIGoToTheQuestionnaireDetailsPage,
} from "../step_definitions/when";
import {
    thenIWillSeeAnEntryDisplayedForTotalmobileReleaseDate,
    thenIHaveTheOptionToChangeOrDeleteTheTotalmobileReleaseDate,
    thenIHaveTheOptionToAddATotalmobileReleaseDate
} from "../step_definitions/then";
import { AuthManager } from "blaise-login-react-client";
import axios from "axios";
import MockAdapeter from "axios-mock-adapter";

jest.mock("blaise-login-react-client");
AuthManager.prototype.loggedIn = jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
});

// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/display_totalmobile_release_date_on_questionnaire_details_page.feature",
    { tagFilter: "not @server and not @integration" }
);

const questionnaireList: IQuestionnaire[] = [];
const mocker = new MockAdapeter(axios);

defineFeature(feature, test => {
    afterEach(() => {
        mocker.reset();
    });

    test("View saved Totalmobile release date in questionnaire details", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireHasATotalmobileReleaseDate(given, mocker);
        whenIGoToTheQuestionnaireDetailsPage(when);
        thenIWillSeeAnEntryDisplayedForTotalmobileReleaseDate(then);
        thenIHaveTheOptionToChangeOrDeleteTheTotalmobileReleaseDate(then);
    });

    test("Add Totalmobile release date in questionnaire details", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireDoesNotHaveATotalmobileReleaseDate(given, mocker);
        whenIGoToTheQuestionnaireDetailsPage(when);
        thenIWillSeeAnEntryDisplayedForTotalmobileReleaseDate(then);
        thenIHaveTheOptionToAddATotalmobileReleaseDate(then);
    });
});
