import "@testing-library/jest-dom/vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterAll, afterEach, describe, vi } from "vitest";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import {
  givenAllInstallsFail,
  givenPackageSelectedForDeploy,
} from "../step_definitions/given";
import { thenCanRetryInstall, thenDeployErrorBanner } from "../step_definitions/then";
import { whenConfirmSelection, whenDeploy } from "../step_definitions/when";

import { createScenario } from "./native_scenario";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const mocker = new MockAdapter(axios, { onNoMatch: "throwException" });

describe("Feature: deploy_questionnaire_failure", () => {
  const Scenario = createScenario();

  afterEach(() => {
    mocker.reset();
  });

  afterAll(() => {
    mocker.restore();
  });

  Scenario("Deployment of selected file failure", ({ Given, When, Then }) => {
    givenAllInstallsFail(Given, mocker);
    givenPackageSelectedForDeploy(Given);
    whenConfirmSelection(When);
    whenDeploy(When);
    thenDeployErrorBanner(Then);
  });

  Scenario("Deploy selected file, retry following failure", ({ Given, When, Then }) => {
    givenAllInstallsFail(Given, mocker);
    givenPackageSelectedForDeploy(Given);
    whenConfirmSelection(When);
    whenDeploy(When);
    thenDeployErrorBanner(Then);
    thenCanRetryInstall(Then);
  });
});
