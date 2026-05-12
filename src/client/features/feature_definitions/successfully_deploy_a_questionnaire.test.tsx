import "@testing-library/jest-dom";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { defineFeature, loadFeature } from "jest-cucumber";

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

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const mocker = new MockAdapter(axios, { onNoMatch: "throwException" });

const feature = loadFeature("./src/client/features/successfully_deploy_a_questionnaire.feature", {
  tagFilter: "not @server and not @integration",
});

defineFeature(feature, (test) => {
  beforeEach(() => {
    mocker.onPut(/^https:\/\/storage\.googleapis\.com/).reply(200);
  });

  afterEach(() => {
    mocker.reset();
  });

  test("Successful log in to Questionnaire Deployment Service", ({ given, when, then }) => {
    givenNoQuestionnairesAreInstalled(given, mocker);

    whenILoadTheHomepage(when);

    thenIAmPresentedWithAnOptionToDeployAQuestionnaire(then);
  });

  test("Select to deploy a new questionnaire", ({ given, when, then }) => {
    givenNoQuestionnairesAreInstalled(given, mocker);

    whenILoadTheHomepage(when);
    whenIClickDeployNewQuestionnaire(when);

    thenIAmPresentedWithAnOptionToDeployAQuestionnaireFile(then);
    thenICanSelectAQuestionnairePackageToInstall(then);
  });

  test("Deploy questionnaire functions disabled", ({ given, when, then }) => {
    given("no questionnaires are installed", () => {
      mocker
        .onGet(/api\/questionnaires\//)
        .reply(() => new Promise((resolve) => setTimeout(() => resolve([404, undefined]), 500)));
      mocker.onGet("/api/questionnaires").reply(200, []);
    });

    whenILoadTheHomepage(when);
    whenIClickDeployNewQuestionnaire(when);
    whenIHaveSelectedADeployPackage(when);
    whenIConfirmMySelectionNoWait(when);

    thenUploadIsDisabled(then);
  });

  test("Deploy selected file", ({ given, when, then }) => {
    givenNoQuestionnairesAreInstalled(given, mocker);

    givenIHaveSelectedTheQuestionnairePackageToDeploy(given);
    givenInstallsSuccessfully(given, mocker);

    whenIConfirmMySelection(when);
    whenISelectToInstallWithNoStartDate(when);
    whenIDeployTheQuestionnaire(when);

    thenTheQuestionnaireIsInstalled(then, mocker);
    thenIAmPresentedWithASuccessfullyDeployedBanner(then);
  });
});
