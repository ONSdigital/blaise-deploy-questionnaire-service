import "@testing-library/jest-dom/vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterAll, afterEach, describe, vi } from "vitest";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import {
  givenIHaveSelectedTheQuestionnairePackageToDeploy,
  givenTheQuestionnaireIsInstalled,
  givenTheQuestionnaireIsLive,
} from "../step_definitions/given";
import {
  thenIAmPresentedWithAConfirmOverwriteWarning,
  thenIAmPresentedWithASuccessfullyDeployedBanner,
  thenIAmPresentedWithTheOptionsToCancelOrOverwrite,
  thenIAmReturnedToTheLandingPage,
  thenICanOnlyReturnToTheLandingPage,
  thenIGetTheQuestionnaireIsLiveWarningBanner,
  thenTheQuestionnaireIsInstalled,
} from "../step_definitions/then";
import {
  whenIConfirmMySelection,
  whenIConfirmNotToOverwrite,
  whenIConfirmToOverwrite,
  whenISelectToOverwrite,
} from "../step_definitions/when";

import { createScenario } from "./native_scenario";

import type { Questionnaire } from "blaise-api-node-client";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const mocker = new MockAdapter(axios, { onNoMatch: "throwException" });

const questionnaireList: Questionnaire[] = [];

describe("Feature: overwrite_existing_questionnaire_when_survey_is_not_live", () => {
  const Scenario = createScenario();

  beforeEach(() => {
    questionnaireList.length = 0;
    mocker.onPut(/^https:\/\/storage\.googleapis\.com/).reply(200, {});
  });

  afterEach(() => {
    mocker.reset();
  });

  afterAll(() => {
    mocker.restore();
  });

  Scenario("Select a new questionnaire package file", ({ Given, When, Then }) => {
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenIHaveSelectedTheQuestionnairePackageToDeploy(Given);

    whenIConfirmMySelection(When);
    thenIAmPresentedWithTheOptionsToCancelOrOverwrite(Then);
  });

  Scenario(
    "Select to overwrite existing questionnaire when it is live",
    ({ Given, When, Then }) => {
      givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
      givenIHaveSelectedTheQuestionnairePackageToDeploy(Given);
      givenTheQuestionnaireIsLive(Given, questionnaireList, mocker);

      whenIConfirmMySelection(When);
      whenISelectToOverwrite(When);

      thenIGetTheQuestionnaireIsLiveWarningBanner(Then);
      thenICanOnlyReturnToTheLandingPage(Then);
    },
  );

  Scenario(
    "Select to overwrite existing questionnaire where no data exists (the questionnaire has been deployed but the sample data has not yet been deployed)",
    ({ Given, When, Then }) => {
      givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
      givenIHaveSelectedTheQuestionnairePackageToDeploy(Given);

      whenIConfirmMySelection(When);
      whenISelectToOverwrite(When);

      thenIAmPresentedWithAConfirmOverwriteWarning(Then);
    },
  );

  Scenario(
    "Confirm overwrite of existing questionnaire package where no data exists (the questionnaire has been deployed but the sample data has not yet been deployed)",
    ({ Given, When, Then }) => {
      givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
      givenIHaveSelectedTheQuestionnairePackageToDeploy(Given);

      whenIConfirmMySelection(When);
      whenISelectToOverwrite(When);
      whenIConfirmToOverwrite(When);

      thenTheQuestionnaireIsInstalled(Then, mocker);
      thenIAmPresentedWithASuccessfullyDeployedBanner(Then);
    },
  );

  Scenario("Cancel overwrite of existing questionnaire package", ({ Given, When, Then }) => {
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenIHaveSelectedTheQuestionnairePackageToDeploy(Given);

    whenIConfirmMySelection(When);
    whenISelectToOverwrite(When);
    whenIConfirmNotToOverwrite(When);

    thenIAmReturnedToTheLandingPage(Then);
  });
});
