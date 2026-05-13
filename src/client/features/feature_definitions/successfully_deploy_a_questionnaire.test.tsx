import "@testing-library/jest-dom/vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterEach, describe, vi } from "vitest";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import {
  givenIHaveSelectedTheQuestionnairePackageToDeploy,
  givenInstallsSuccessfully,
  givenNoQuestionnairesAreInstalled,
} from "../step_definitions/given";
import {
  thenIAmPresentedWithAnOptionToDeployAQuestionnaire,
  thenIAmPresentedWithAnOptionToDeployAQuestionnaireFile,
  thenIAmPresentedWithASuccessfullyDeployedBanner,
  thenICanSelectAQuestionnairePackageToInstall,
  thenTheQuestionnaireIsInstalled,
  thenUploadIsDisabled,
} from "../step_definitions/then";
import {
  whenIClickDeployNewQuestionnaire,
  whenIConfirmMySelection,
  whenIConfirmMySelectionNoWait,
  whenIDeployTheQuestionnaire,
  whenIHaveSelectedADeployPackage,
  whenILoadTheHomepage,
  whenISelectToInstallWithNoStartDate,
} from "../step_definitions/when";

import { createScenario } from "./nativeScenario";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const mocker = new MockAdapter(axios, { onNoMatch: "throwException" });

describe("Feature: successfully_deploy_a_questionnaire", () => {
  const Scenario = createScenario();

  beforeEach(() => {
    mocker.onPut(/^https:\/\/storage\.googleapis\.com/).reply(200);
  });

  afterEach(() => {
    mocker.reset();
  });

  Scenario("Successful log in to Questionnaire Deployment Service", ({ Given, When, Then }) => {
    givenNoQuestionnairesAreInstalled(Given, mocker);

    whenILoadTheHomepage(When);

    thenIAmPresentedWithAnOptionToDeployAQuestionnaire(Then);
  });

  Scenario("Select to deploy a new questionnaire", ({ Given, When, Then }) => {
    givenNoQuestionnairesAreInstalled(Given, mocker);

    whenILoadTheHomepage(When);
    whenIClickDeployNewQuestionnaire(When);

    thenIAmPresentedWithAnOptionToDeployAQuestionnaireFile(Then);
    thenICanSelectAQuestionnairePackageToInstall(Then);
  });

  Scenario("Deploy questionnaire functions disabled", ({ Given, When, Then }) => {
    Given("no questionnaires are installed", () => {
      mocker
        .onGet(/api\/questionnaires\//)
        .reply(() => new Promise((resolve) => setTimeout(() => resolve([404, undefined]), 500)));
      mocker.onGet("/api/questionnaires").reply(200, []);
    });

    whenILoadTheHomepage(When);
    whenIClickDeployNewQuestionnaire(When);
    whenIHaveSelectedADeployPackage(When);
    whenIConfirmMySelectionNoWait(When);

    thenUploadIsDisabled(Then);
  });

  Scenario("Deploy selected file", ({ Given, When, Then }) => {
    givenNoQuestionnairesAreInstalled(Given, mocker);

    givenIHaveSelectedTheQuestionnairePackageToDeploy(Given);
    givenInstallsSuccessfully(Given, mocker);

    whenIConfirmMySelection(When);
    whenISelectToInstallWithNoStartDate(When);
    whenIDeployTheQuestionnaire(When);

    thenTheQuestionnaireIsInstalled(Then, mocker);
    thenIAmPresentedWithASuccessfullyDeployedBanner(Then);
  });
});
