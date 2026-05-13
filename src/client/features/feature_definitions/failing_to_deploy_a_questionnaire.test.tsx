import "@testing-library/jest-dom/vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterEach, describe, vi } from "vitest";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import {
  givenAllInstallsWillFail,
  givenIHaveSelectedTheQuestionnairePackageToDeploy,
} from "../step_definitions/given";
import { thenICanRetryAnInstall, thenIGetAnErrorBanner } from "../step_definitions/then";
import { whenIConfirmMySelection, whenIDeploy } from "../step_definitions/when";

import { createScenario } from "./nativeScenario";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const mocker = new MockAdapter(axios);

describe("Feature: failing_to_deploy_a_questionnaire", () => {
  const Scenario = createScenario();

  afterEach(() => {
    mocker.reset();
  });

  Scenario("Deployment of selected file failure", ({ Given, When, Then }) => {
    givenAllInstallsWillFail(Given, mocker);
    givenIHaveSelectedTheQuestionnairePackageToDeploy(Given);

    whenIConfirmMySelection(When);
    whenIDeploy(When);

    thenIGetAnErrorBanner(Then);
  });

  Scenario("Deploy selected file, retry following failure", ({ Given, When, Then }) => {
    givenAllInstallsWillFail(Given, mocker);
    givenIHaveSelectedTheQuestionnairePackageToDeploy(Given);

    whenIConfirmMySelection(When);
    whenIDeploy(When);

    thenIGetAnErrorBanner(Then);
    thenICanRetryAnInstall(Then);
  });
});
