import "@testing-library/jest-dom/vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterAll, afterEach, describe, vi } from "vitest";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import { createScenario } from "../feature_scenario_runner";
import {
  givenPackageSelectedForDeploy,
  givenQuestionnaireInstalled,
  givenQuestionnaireIsLive,
} from "../step_definitions/given";
import {
  thenCanOnlyReturnToLandingPage,
  thenConfirmOverwriteWarning,
  thenDeploySuccessBanner,
  thenLiveQuestionnaireWarning,
  thenQuestionnaireInstalled,
  thenReturnedToLandingPage,
} from "../step_definitions/then";
import {
  whenCancelOverwrite,
  whenConfirmOverwrite,
  whenConfirmSelection,
  whenProceedToOverwrite,
} from "../step_definitions/when";

import type { Questionnaire } from "blaise-api-node-client";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const mocker = new MockAdapter(axios, { onNoMatch: "throwException" });

const questionnaireList: Questionnaire[] = [];

describe("Feature: overwrite_existing_questionnaire", () => {
  const Scenario = createScenario({ questionnaireName: "OPN2004A" });

  beforeEach(() => {
    questionnaireList.length = 0;
    mocker.onPut(/^https:\/\/storage\.googleapis\.com\//).reply(200, {});
  });

  afterEach(() => {
    mocker.reset();
  });

  afterAll(() => {
    mocker.restore();
  });

  Scenario(
    "Select to overwrite existing questionnaire when it is live",
    ({ Given, When, Then }) => {
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenPackageSelectedForDeploy(Given);
      givenQuestionnaireIsLive(Given, questionnaireList, mocker);
      whenConfirmSelection(When);
      whenProceedToOverwrite(When);
      thenLiveQuestionnaireWarning(Then);
      thenCanOnlyReturnToLandingPage(Then);
    },
  );

  Scenario(
    "Select to overwrite existing questionnaire where no data exists (the questionnaire has been deployed but the sample data has not yet been deployed)",
    ({ Given, When, Then }) => {
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenPackageSelectedForDeploy(Given);
      whenConfirmSelection(When);
      whenProceedToOverwrite(When);
      thenConfirmOverwriteWarning(Then);
    },
  );

  Scenario(
    "Confirm overwrite of existing questionnaire package where no data exists (the questionnaire has been deployed but the sample data has not yet been deployed)",
    ({ Given, When, Then }) => {
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenPackageSelectedForDeploy(Given);
      whenConfirmSelection(When);
      whenProceedToOverwrite(When);
      whenConfirmOverwrite(When);
      thenQuestionnaireInstalled(Then, mocker);
      thenDeploySuccessBanner(Then);
    },
  );

  Scenario(
    {
      name: "Cancel overwrite of existing questionnaire package",
      args: { selection: "cancel" },
    },
    ({ Given, When, Then }) => {
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenPackageSelectedForDeploy(Given);
      whenConfirmSelection(When);
      whenProceedToOverwrite(When);
      whenCancelOverwrite(When);
      thenReturnedToLandingPage(Then);
    },
  );
});
