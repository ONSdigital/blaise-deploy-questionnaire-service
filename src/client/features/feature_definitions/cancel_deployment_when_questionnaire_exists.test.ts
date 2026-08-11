import "@testing-library/jest-dom/vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterAll, afterEach, describe, vi } from "vitest";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import { createScenario } from "../feature_scenario_runner";
import {
  givenPackageSelectedForDeploy,
  givenQuestionnaireInstalled,
} from "../step_definitions/given";
import { thenCancelOrOverwriteOptions, thenReturnedToLandingPage } from "../step_definitions/then";
import { whenCancelDeployment, whenConfirmSelection } from "../step_definitions/when";

import type { Questionnaire } from "blaise-api-node-client";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const questionnaireList: Questionnaire[] = [];
const mocker = new MockAdapter(axios, { onNoMatch: "throwException" });

describe("Feature: cancel_deployment_when_questionnaire_exists", () => {
  const Scenario = createScenario({ questionnaireName: "OPN2004A" });

  afterEach(() => {
    mocker.reset();
  });

  afterAll(() => {
    mocker.restore();
  });

  Scenario("Questionnaire exists", ({ Given, When, Then }) => {
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    givenPackageSelectedForDeploy(Given);
    whenConfirmSelection(When);
    thenCancelOrOverwriteOptions(Then);
  });

  Scenario(
    {
      name: "Back-out of deploying existing questionnaire",
      args: { selection: "cancel" },
    },
    ({ Given, When, Then }) => {
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenPackageSelectedForDeploy(Given);
      whenConfirmSelection(When);
      whenCancelDeployment(When);
      thenReturnedToLandingPage(Then);
    },
  );
});
