import "@testing-library/jest-dom/vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterAll, afterEach, describe, vi } from "vitest";

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

import { createScenario } from "./nativeScenario";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const mocker = new MockAdapter(axios, { onNoMatch: "throwException" });

describe("Feature: incorrect_questionnaire_settings", () => {
  const Scenario = createScenario();

  beforeEach(() => {
    mocker.onPut(/^https:\/\/storage\.googleapis\.com/).reply(200);
  });

  afterEach(() => {
    mocker.reset();
  });

  afterAll(() => {
    mocker.restore();
  });

  Scenario("Display warning When settings are incorrect", ({ Given, When, Then }) => {
    givenNoQuestionnairesAreInstalled(Given, mocker);
    givenIHaveSelectedTheQuestionnairePackageToDeploy(Given);
    givenInstallsSuccessfully(Given, mocker);
    givenTheQuestionnaireHasModes(Given, mocker);
    givenTheQuestionnaireHasTheSettings(Given, mocker);

    whenIConfirmMySelection(When);
    whenISelectToInstallWithNoStartDate(When);
    whenIDeployTheQuestionnaire(When);

    thenTheQuestionnaireIsDeactivated(Then, mocker);
    thenAWarningIsDisplayedWithTheMessage(Then);
    thenIGetTheOptionToContinueOrCancel(Then);
  });

  Scenario("Choose to continue with incorrect settings", ({ Given, When, Then }) => {
    givenNoQuestionnairesAreInstalled(Given, mocker);
    givenIHaveSelectedTheQuestionnairePackageToDeploy(Given);
    givenInstallsSuccessfully(Given, mocker);
    givenTheQuestionnaireHasModes(Given, mocker);
    givenTheQuestionnaireHasTheSettings(Given, mocker);

    whenIConfirmMySelection(When);
    whenISelectToInstallWithNoStartDate(When);
    whenIDeployTheQuestionnaire(When);
    whenIChooseToDeployAnyway(When);

    thenTheQuestionnaireIsInstalled(Then, mocker);
    thenTheQuestionnaireIsActivated(Then, mocker);
    thenIAmPresentedWithASuccessfullyDeployedBanner(Then);
  });

  Scenario("Choose cancel and rectify settings issue", ({ Given, When, Then }) => {
    givenNoQuestionnairesAreInstalled(Given, mocker);
    givenIHaveSelectedTheQuestionnairePackageToDeploy(Given);
    givenInstallsSuccessfully(Given, mocker);
    givenTheQuestionnaireHasModes(Given, mocker);
    givenTheQuestionnaireHasTheSettings(Given, mocker);

    whenIConfirmMySelection(When);
    whenISelectToInstallWithNoStartDate(When);
    whenIDeployTheQuestionnaire(When);
    whenIChooseToCancel(When);

    thenTheQuestionnaireDataIsDeleted(Then, mocker);
    thenIAmReturnedToTheLandingPage(Then);
  });

  Scenario("Install with correct settings", ({ Given, When, Then }) => {
    givenNoQuestionnairesAreInstalled(Given, mocker);
    givenIHaveSelectedTheQuestionnairePackageToDeploy(Given);
    givenInstallsSuccessfully(Given, mocker);
    givenTheQuestionnaireHasModes(Given, mocker);
    givenTheQuestionnaireHasTheSettings(Given, mocker);

    whenIConfirmMySelection(When);
    whenISelectToInstallWithNoStartDate(When);
    whenIDeployTheQuestionnaire(When);

    thenTheQuestionnaireIsInstalled(Then, mocker);
    thenIAmPresentedWithASuccessfullyDeployedBanner(Then);
  });
});
