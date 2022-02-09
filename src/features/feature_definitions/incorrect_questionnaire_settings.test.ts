// Test modules
import { defineFeature, loadFeature } from "jest-cucumber";
import { cleanup, } from "@testing-library/react";
import "@testing-library/jest-dom";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

import { whenIChooseToDeployAnyway, whenIChooseToCancel, whenIConfirmMySelection, whenIDeployTheQuestionnaire, whenISelectToInstallWithNoStartDate, } from "../step_definitions/when";
import { thenAWarningIsDisplayedWithTheMessage, thenIAmPresentedWithASuccessfullyDeployedBanner, thenIAmReturnedToTheLandingPage, thenIGetTheOptionToContinueOrCancel, thenTheQuestionnaireDataIsDeleted, thenTheQuestionnaireIsActivated, thenTheQuestionnaireIsDeactivated, thenTheQuestionnaireIsInstalled } from "../step_definitions/then";
import { givenIHaveSelectedTheQuestionnairePacakgeToDeploy, givenInstallsSuccessfully, givenNoQuestionnairesAreInstalled, givenTheQuestionnaireHasModes, givenTheQuestionnareHasTheSettings } from "../step_definitions/given";
import { Mocker } from "../step_definitions/helpers/mocker";

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

// Load in feature details from .feature file
const feature = loadFeature(
  "./src/features/incorrect_questionnaire_settings.feature",
  { tagFilter: "not @server and not @integration" }
);

const mocker = new Mocker();

defineFeature(feature, test => {
  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
    jest.resetModules();
    mock.reset();
  });

  beforeEach(() => {
    mock.onPut(/^https:\/\/storage\.googleapis\.com/).reply(200);
  });

  test("Display warning when settings are incorrect", ({ given, when, then }) => {
    givenNoQuestionnairesAreInstalled(given, mocker);
    givenIHaveSelectedTheQuestionnairePacakgeToDeploy(given);
    givenInstallsSuccessfully(given, mocker);
    givenTheQuestionnaireHasModes(given, mocker);
    givenTheQuestionnareHasTheSettings(given, mocker);

    whenIConfirmMySelection(when);
    whenISelectToInstallWithNoStartDate(when);
    whenIDeployTheQuestionnaire(when);

    thenTheQuestionnaireIsDeactivated(then);
    thenAWarningIsDisplayedWithTheMessage(then);
    thenIGetTheOptionToContinueOrCancel(then);
  });

  test("Choose to continue with incorrect settings", ({ given, when, then }) => {
    givenNoQuestionnairesAreInstalled(given, mocker);
    givenIHaveSelectedTheQuestionnairePacakgeToDeploy(given);
    givenInstallsSuccessfully(given, mocker);
    givenTheQuestionnaireHasModes(given, mocker);
    givenTheQuestionnareHasTheSettings(given, mocker);

    whenIConfirmMySelection(when);
    whenISelectToInstallWithNoStartDate(when);
    whenIDeployTheQuestionnaire(when);
    whenIChooseToDeployAnyway(when);

    thenTheQuestionnaireIsInstalled(then);
    thenTheQuestionnaireIsActivated(then);
    thenIAmPresentedWithASuccessfullyDeployedBanner(then);
  });

  test("Choose cancel and rectify settings issue", ({ given, when, then }) => {
    givenNoQuestionnairesAreInstalled(given, mocker);
    givenIHaveSelectedTheQuestionnairePacakgeToDeploy(given);
    givenInstallsSuccessfully(given, mocker);
    givenTheQuestionnaireHasModes(given, mocker);
    givenTheQuestionnareHasTheSettings(given, mocker);

    whenIConfirmMySelection(when);
    whenISelectToInstallWithNoStartDate(when);
    whenIDeployTheQuestionnaire(when);
    whenIChooseToCancel(when);

    thenTheQuestionnaireDataIsDeleted(then);
    thenIAmReturnedToTheLandingPage(then);
  });

  test("Install with correct settings", ({ given, when, then }) => {
    givenNoQuestionnairesAreInstalled(given, mocker);
    givenIHaveSelectedTheQuestionnairePacakgeToDeploy(given);
    givenInstallsSuccessfully(given, mocker);
    givenTheQuestionnaireHasModes(given, mocker);
    givenTheQuestionnareHasTheSettings(given, mocker);

    whenIConfirmMySelection(when);
    whenISelectToInstallWithNoStartDate(when);
    whenIDeployTheQuestionnaire(when);

    thenTheQuestionnaireIsInstalled(then);
    thenIAmPresentedWithASuccessfullyDeployedBanner(then);
  });
});
