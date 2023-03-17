/**
 * @jest-environment jsdom
 */

// Test modules
import { defineFeature, loadFeature } from "jest-cucumber";
import "@testing-library/jest-dom";

import { givenIHaveSelectedTheQuestionnairePackageToDeploy, givenNoQuestionnairesAreInstalled } from "../step_definitions/given";
import {
    thenIAmGivenASummaryOfTheDeployment,
    thenIAmPresentedWithAnOptionToSpecifyATMReleaseDate,
    thenICanViewTheTotalmobileReleaseDateIsSetTo,
    thenTheSummaryPageHasNoTMReleaseDate,
} from "../step_definitions/then";
import {
    whenIConfirmMySelection,
    whenISelectTheContinueButton, whenISelectToInstallWithNoTMReleaseDate,
    whenISelectToInstallWithNoStartDate,
    whenISpecifyATotalmobileReleaseDateOf,
} from "../step_definitions/when";
import { AuthManager } from "blaise-login-react-client";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

jest.mock("blaise-login-react-client");
AuthManager.prototype.loggedIn = jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
});

// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/add_option_to_set_a_totalmobile_release_date.feature",
    { tagFilter: "not @server and not @integration" }
);

const mocker = new MockAdapter(axios);

defineFeature(feature, test => {
    afterEach(() => {
        mocker.reset();
    });

    test("Present Totalmobile release date selector", ({ given, when, then }) => {
        givenNoQuestionnairesAreInstalled(given, mocker);
        givenIHaveSelectedTheQuestionnairePackageToDeploy(given);
        whenIConfirmMySelection(when);
        whenISelectToInstallWithNoStartDate(when);
        thenIAmPresentedWithAnOptionToSpecifyATMReleaseDate(then);
    });

    test("Non LMS questionnaire does not see the release date selector", ({ given, when, then }) => {
        givenNoQuestionnairesAreInstalled(given, mocker);
        givenIHaveSelectedTheQuestionnairePackageToDeploy(given);
        whenIConfirmMySelection(when);
        whenISelectToInstallWithNoStartDate(when);
        thenIAmGivenASummaryOfTheDeployment(then);
    });

    test("Totalmobile date selected", ({ given, when, then }) => {
        givenNoQuestionnairesAreInstalled(given, mocker);
        givenIHaveSelectedTheQuestionnairePackageToDeploy(given);
        whenIConfirmMySelection(when);
        whenISelectToInstallWithNoStartDate(when);
        whenISpecifyATotalmobileReleaseDateOf(when);
        whenISelectTheContinueButton(when);
        thenICanViewTheTotalmobileReleaseDateIsSetTo(then);
    });

    test("If I select no date to be set", ({ given, when, then }) => {
        givenNoQuestionnairesAreInstalled(given, mocker);
        givenIHaveSelectedTheQuestionnairePackageToDeploy(given);
        whenIConfirmMySelection(when);
        whenISelectToInstallWithNoStartDate(when);
        whenISelectToInstallWithNoTMReleaseDate(when);
        thenTheSummaryPageHasNoTMReleaseDate(then);
    });
});
