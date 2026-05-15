import "@testing-library/jest-dom/vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterAll, afterEach, describe, vi } from "vitest";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import {
  givenNoQuestionnairesInstalled,
  givenPackageSelectedForDeploy,
  givenQuestionnaireInstallsSuccessfully,
} from "../step_definitions/given";
import {
  thenCanSelectPackage,
  thenDeployFileOption,
  thenDeployOption,
  thenDeploySuccessBanner,
  thenQuestionnaireInstalled,
  thenUploadDisabled,
} from "../step_definitions/then";
import {
  whenClickDeployNew,
  whenConfirmSelection,
  whenConfirmSelectionNoFlush,
  whenDeployQuestionnaire,
  whenLoadHomepage,
  whenSelectDeployPackage,
  whenSkipToStartDate,
} from "../step_definitions/when";

import { createScenario } from "./native_scenario";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const mocker = new MockAdapter(axios, { onNoMatch: "throwException" });

describe("Feature: deploy_questionnaire", () => {
  const Scenario = createScenario();

  beforeEach(() => {
    mocker.onPut(/^https:\/\/storage\.googleapis\.com\//).reply(200);
  });

  afterEach(() => {
    mocker.reset();
  });

  afterAll(() => {
    mocker.restore();
  });

  Scenario("Login to Questionnaire Deployment Service", ({ Given, When, Then }) => {
    givenNoQuestionnairesInstalled(Given, mocker);
    whenLoadHomepage(When);
    thenDeployOption(Then);
  });

  Scenario("Deploy questionnaire", ({ Given, When, Then }) => {
    givenNoQuestionnairesInstalled(Given, mocker);
    whenLoadHomepage(When);
    whenClickDeployNew(When);
    thenDeployFileOption(Then);
    thenCanSelectPackage(Then);
  });

  Scenario("Deploy questionnaire functions disabled", ({ Given, When, Then }) => {
    Given("no questionnaires are installed", () => {
      mocker
        .onGet(/api\/questionnaires\//)
        .reply(() => new Promise((resolve) => setTimeout(() => resolve([404, undefined]), 500)));
      mocker.onGet("/api/questionnaires").reply(200, []);
    });
    whenLoadHomepage(When);
    whenClickDeployNew(When);
    whenSelectDeployPackage(When);
    whenConfirmSelectionNoFlush(When);
    thenUploadDisabled(Then);
  });

  Scenario("Deploy selected file", ({ Given, When, Then }) => {
    givenNoQuestionnairesInstalled(Given, mocker);
    givenPackageSelectedForDeploy(Given);
    givenQuestionnaireInstallsSuccessfully(Given, mocker);
    whenConfirmSelection(When);
    whenSkipToStartDate(When);
    whenDeployQuestionnaire(When);
    thenQuestionnaireInstalled(Then, mocker);
    thenDeploySuccessBanner(Then);
  });
});
