import "@testing-library/jest-dom/vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterAll, afterEach, describe, vi } from "vitest";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import { createScenario } from "../feature_scenario_runner";
import {
  givenNoQuestionnairesInstalled,
  givenPackageSelectedForDeploy,
  givenToStartDateFails,
} from "../step_definitions/given";
import {
  thenDeployErrorBannerWithMessage,
  thenSummaryHasNoToStartDate,
  thenToStartDatePrompt,
  thenToStartDateShown,
} from "../step_definitions/then";
import {
  whenClickContinue,
  whenConfirmSelection,
  whenDeployQuestionnaire,
  whenSkipToStartDate,
  whenSpecifyToStartDate,
} from "../step_definitions/when";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const mocker = new MockAdapter(axios, { onNoMatch: "throwException" });

describe("Feature: set_telephone_operations_start_date", () => {
  const Scenario = createScenario({ date: "05/06/2030", questionnaireName: "OPN2004A" });

  afterEach(() => {
    mocker.reset();
  });

  afterAll(() => {
    mocker.restore();
  });

  Scenario("Present Telephone Operations start date option", ({ Given, When, Then }) => {
    givenNoQuestionnairesInstalled(Given, mocker);
    givenPackageSelectedForDeploy(Given);
    whenConfirmSelection(When);
    thenToStartDatePrompt(Then);
  });

  Scenario("Enter Telephone Operations start date", ({ Given, When, Then }) => {
    givenNoQuestionnairesInstalled(Given, mocker);
    givenPackageSelectedForDeploy(Given);
    whenConfirmSelection(When);
    whenSpecifyToStartDate(When);
    whenClickContinue(When);
    thenToStartDateShown(Then);
  });

  Scenario("Do not enter Telephone Operations start date", ({ Given, When, Then }) => {
    givenNoQuestionnairesInstalled(Given, mocker);
    givenPackageSelectedForDeploy(Given);
    whenConfirmSelection(When);
    whenSkipToStartDate(When);
    thenSummaryHasNoToStartDate(Then);
  });

  Scenario(
    "Setting the Telephone Operations start date fails during deployment",
    ({ Given, When, Then }) => {
      givenNoQuestionnairesInstalled(Given, mocker);
      givenToStartDateFails(Given, mocker);
      givenPackageSelectedForDeploy(Given);
      whenConfirmSelection(When);
      whenSpecifyToStartDate(When);
      whenClickContinue(When);
      whenDeployQuestionnaire(When);
      thenDeployErrorBannerWithMessage(Then);
    },
  );
});
