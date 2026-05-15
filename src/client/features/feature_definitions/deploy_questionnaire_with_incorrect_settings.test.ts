import "@testing-library/jest-dom/vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterAll, afterEach, describe, vi } from "vitest";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import {
  givenPackageSelectedForDeploy,
  givenQuestionnaireInstallsSuccessfully,
  givenNoQuestionnairesInstalled,
  givenQuestionnaireHasModes,
  givenQuestionnaireHasSettings,
} from "../step_definitions/given";
import {
  thenIncorrectSettingsWarning,
  thenDeploySuccessBanner,
  thenReturnedToLandingPage,
  thenContinueOrCancelOption,
  thenQuestionnaireDeleted,
  thenQuestionnaireActivated,
  thenQuestionnaireDeactivated,
  thenQuestionnaireInstalled,
} from "../step_definitions/then";
import {
  whenChooseCancel,
  whenDeployAnyway,
  whenConfirmSelection,
  whenDeployQuestionnaire,
  whenSkipToStartDate,
} from "../step_definitions/when";

import { createScenario } from "./native_scenario";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const mocker = new MockAdapter(axios, { onNoMatch: "throwException" });

describe("Feature: deploy_questionnaire_with_incorrect_settings", () => {
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
    givenNoQuestionnairesInstalled(Given, mocker);
    givenPackageSelectedForDeploy(Given);
    givenQuestionnaireInstallsSuccessfully(Given, mocker);
    givenQuestionnaireHasModes(Given, mocker);
    givenQuestionnaireHasSettings(Given, mocker);
    whenConfirmSelection(When);
    whenSkipToStartDate(When);
    whenDeployQuestionnaire(When);
    thenQuestionnaireDeactivated(Then, mocker);
    thenIncorrectSettingsWarning(Then);
    thenContinueOrCancelOption(Then);
  });

  Scenario("Choose to continue with incorrect settings", ({ Given, When, Then }) => {
    givenNoQuestionnairesInstalled(Given, mocker);
    givenPackageSelectedForDeploy(Given);
    givenQuestionnaireInstallsSuccessfully(Given, mocker);
    givenQuestionnaireHasModes(Given, mocker);
    givenQuestionnaireHasSettings(Given, mocker);
    whenConfirmSelection(When);
    whenSkipToStartDate(When);
    whenDeployQuestionnaire(When);
    whenDeployAnyway(When);
    thenQuestionnaireInstalled(Then, mocker);
    thenQuestionnaireActivated(Then, mocker);
    thenDeploySuccessBanner(Then);
  });

  Scenario("Choose cancel and rectify settings issue", ({ Given, When, Then }) => {
    givenNoQuestionnairesInstalled(Given, mocker);
    givenPackageSelectedForDeploy(Given);
    givenQuestionnaireInstallsSuccessfully(Given, mocker);
    givenQuestionnaireHasModes(Given, mocker);
    givenQuestionnaireHasSettings(Given, mocker);
    whenConfirmSelection(When);
    whenSkipToStartDate(When);
    whenDeployQuestionnaire(When);
    whenChooseCancel(When);
    thenQuestionnaireDeleted(Then, mocker);
    thenReturnedToLandingPage(Then);
  });

  Scenario("Install with correct settings", ({ Given, When, Then }) => {
    givenNoQuestionnairesInstalled(Given, mocker);
    givenPackageSelectedForDeploy(Given);
    givenQuestionnaireInstallsSuccessfully(Given, mocker);
    givenQuestionnaireHasModes(Given, mocker);
    givenQuestionnaireHasSettings(Given, mocker);
    whenConfirmSelection(When);
    whenSkipToStartDate(When);
    whenDeployQuestionnaire(When);
    thenQuestionnaireInstalled(Then, mocker);
    thenDeploySuccessBanner(Then);
  });
});
