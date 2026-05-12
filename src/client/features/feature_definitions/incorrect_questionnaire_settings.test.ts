import "@testing-library/jest-dom";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { defineFeature, loadFeature } from "jest-cucumber";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import {
  givenIHaveSelectedTheQuestionnairePackageToDeploy,
  givenInstallsSuccessfully,
  givenNoQuestionnairesAreInstalled,
  givenTheQuestionnaireHasModes,
  givenTheQuestionnaireHasTheSettings,
} from "../step_definitions/given";
import {
  thenAWarningIsDisplayedWithTheMessage,
  thenIAmPresentedWithASuccessfullyDeployedBanner,
  thenIAmReturnedToTheLandingPage,
  thenIGetTheOptionToContinueOrCancel,
  thenTheQuestionnaireDataIsDeleted,
  thenTheQuestionnaireIsActivated,
  thenTheQuestionnaireIsDeactivated,
  thenTheQuestionnaireIsInstalled,
} from "../step_definitions/then";
import {
  whenIChooseToCancel,
  whenIChooseToDeployAnyway,
  whenIConfirmMySelection,
  whenIDeployTheQuestionnaire,
  whenISelectToInstallWithNoStartDate,
} from "../step_definitions/when";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const mocker = new MockAdapter(axios, { onNoMatch: "throwException" });

const feature = loadFeature("./src/client/features/incorrect_questionnaire_settings.feature", {
  tagFilter: "not @server and not @integration",
});

defineFeature(feature, (test) => {
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
    givenTheQuestionnaireHasTheSettings(given, mocker);

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
    givenTheQuestionnaireHasTheSettings(given, mocker);

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
    givenTheQuestionnaireHasTheSettings(given, mocker);

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
    givenTheQuestionnaireHasTheSettings(given, mocker);

    whenIConfirmMySelection(when);
    whenISelectToInstallWithNoStartDate(when);
    whenIDeployTheQuestionnaire(when);

    thenTheQuestionnaireIsInstalled(then, mocker);
    thenIAmPresentedWithASuccessfullyDeployedBanner(then);
  });
});
