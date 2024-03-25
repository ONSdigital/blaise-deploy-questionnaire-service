/**
 * @jest-environment jsdom
 */

// Test modules
import { defineFeature, loadFeature } from "jest-cucumber";
import "@testing-library/jest-dom";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

import { whenIChooseToDeployAnyway, whenIChooseToCancel, whenIConfirmMySelection, whenIDeployTheQuestionnaire, whenISelectToInstallWithNoStartDate, } from "../step_definitions/when";
import { thenAWarningIsDisplayedWithTheMessage, thenIAmPresentedWithASuccessfullyDeployedBanner, thenIAmReturnedToTheLandingPage, thenIGetTheOptionToContinueOrCancel, thenTheQuestionnaireDataIsDeleted, thenTheQuestionnaireIsActivated, thenTheQuestionnaireIsDeactivated, thenTheQuestionnaireIsInstalled } from "../step_definitions/then";
import { givenIHaveSelectedTheQuestionnairePackageToDeploy, givenInstallsSuccessfully, givenNoQuestionnairesAreInstalled, givenTheQuestionnaireHasModes, givenTheQuestionnareHasTheSettings } from "../step_definitions/given";
import { Authenticate } from "blaise-login-react/blaise-login-react-client";

// mock login
jest.mock("blaise-login-react/blaise-login-react-client");
const { MockAuthenticate } = jest.requireActual("blaise-login-react/blaise-login-react-client");
Authenticate.prototype.render = MockAuthenticate.prototype.render;
MockAuthenticate.OverrideReturnValues(null, true);

const mocker = new MockAdapter(axios, { onNoMatch: "throwException" });

// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/incorrect_questionnaire_settings.feature",
    { tagFilter: "not @server and not @integration" }
);

defineFeature(feature, test => {
    beforeEach(() => {
        mocker.onPut(/^https:\/\/storage\.googleapis\.com/).reply(200);
    });

    afterEach(() => {
        mocker.reset();
    });

    test("Display warning when settings are incorrect", ({ given, when, then }) => {
        givenNoQuestionnairesAreInstalled(given, mocker);
        givenIHaveSelectedTheQuestionnairePackageToDeploy(given);
        givenInstallsSuccessfully(given, mocker);
        givenTheQuestionnaireHasModes(given, mocker);
        givenTheQuestionnareHasTheSettings(given, mocker);

        whenIConfirmMySelection(when);
        whenISelectToInstallWithNoStartDate(when);
        whenIDeployTheQuestionnaire(when);

        thenTheQuestionnaireIsDeactivated(then, mocker);
        thenAWarningIsDisplayedWithTheMessage(then);
        thenIGetTheOptionToContinueOrCancel(then);
    });

    test("Choose to continue with incorrect settings", ({ given, when, then }) => {
        givenNoQuestionnairesAreInstalled(given, mocker);
        givenIHaveSelectedTheQuestionnairePackageToDeploy(given);
        givenInstallsSuccessfully(given, mocker);
        givenTheQuestionnaireHasModes(given, mocker);
        givenTheQuestionnareHasTheSettings(given, mocker);

        whenIConfirmMySelection(when);
        whenISelectToInstallWithNoStartDate(when);
        whenIDeployTheQuestionnaire(when);
        whenIChooseToDeployAnyway(when);

        thenTheQuestionnaireIsInstalled(then, mocker);
        thenTheQuestionnaireIsActivated(then, mocker);
        thenIAmPresentedWithASuccessfullyDeployedBanner(then);
    });

    test("Choose cancel and rectify settings issue", ({ given, when, then }) => {
        givenNoQuestionnairesAreInstalled(given, mocker);
        givenIHaveSelectedTheQuestionnairePackageToDeploy(given);
        givenInstallsSuccessfully(given, mocker);
        givenTheQuestionnaireHasModes(given, mocker);
        givenTheQuestionnareHasTheSettings(given, mocker);

        whenIConfirmMySelection(when);
        whenISelectToInstallWithNoStartDate(when);
        whenIDeployTheQuestionnaire(when);
        whenIChooseToCancel(when);

        thenTheQuestionnaireDataIsDeleted(then, mocker);
        thenIAmReturnedToTheLandingPage(then);
    });

    test("Install with correct settings", ({ given, when, then }) => {
        givenNoQuestionnairesAreInstalled(given, mocker);
        givenIHaveSelectedTheQuestionnairePackageToDeploy(given);
        givenInstallsSuccessfully(given, mocker);
        givenTheQuestionnaireHasModes(given, mocker);
        givenTheQuestionnareHasTheSettings(given, mocker);

        whenIConfirmMySelection(when);
        whenISelectToInstallWithNoStartDate(when);
        whenIDeployTheQuestionnaire(when);

        thenTheQuestionnaireIsInstalled(then, mocker);
        thenIAmPresentedWithASuccessfullyDeployedBanner(then);
    });
});
