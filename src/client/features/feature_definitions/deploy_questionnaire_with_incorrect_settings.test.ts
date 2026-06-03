import "@testing-library/jest-dom/vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterAll, afterEach, describe, vi } from "vitest";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import { createScenario } from "../feature_scenario_runner";
import {
  givenNoQuestionnairesInstalled,
  givenPackageSelectedForDeploy,
  givenQuestionnaireHasModes,
  givenQuestionnaireHasSettings,
  givenQuestionnaireInstallsSuccessfully,
} from "../step_definitions/given";
import {
  thenContinueOrCancelOption,
  thenDeploySuccessBanner,
  thenIncorrectSettingsWarning,
  thenQuestionnaireActivated,
  thenQuestionnaireDeactivated,
  thenQuestionnaireDeleted,
  thenQuestionnaireInstalled,
  thenReturnedToLandingPage,
} from "../step_definitions/then";
import {
  whenChooseCancel,
  whenConfirmSelection,
  whenDeployAnyway,
  whenDeployQuestionnaire,
  whenSkipToStartDate,
} from "../step_definitions/when";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const mocker = new MockAdapter(axios, { onNoMatch: "throwException" });

describe("Feature: deploy_questionnaire_with_incorrect_settings", () => {
  const Scenario = createScenario({ questionnaireName: "OPN2004A" });

  beforeEach(() => {
    mocker.onPut(/^https:\/\/storage\.googleapis\.com\//).reply(200);
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

  Scenario(
    {
      name: "Install with correct settings",
      args: {
        settingsTable: [
          {
            type: "StrictInterviewing",
            saveSessionOnTimeout: "true",
            saveSessionOnQuit: "true",
            deleteSessionOnTimeout: "true",
            deleteSessionOnQuit: "true",
            sessionTimeout: "15",
            applyRecordLocking: "true",
          },
        ],
      },
    },
    ({ Given, When, Then }) => {
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
    },
  );
});
