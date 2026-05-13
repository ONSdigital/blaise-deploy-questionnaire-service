import "@testing-library/jest-dom/vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterAll, afterEach, describe, vi } from "vitest";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import {
  givenTheQuestionnaireHasActiveSurveyDays,
  givenTheQuestionnaireHasModes,
  givenTheQuestionnaireIsActive,
  givenTheQuestionnaireIsInactive,
  givenTheQuestionnaireIsInstalled,
} from "../step_definitions/given";
import {
  thenIAmPresentedWithAnActiveSurveyDaysWarning,
  thenIAmPresentedWithAnActiveWebCollectionWarning,
  thenIAmPresentedWithAWarning,
  thenIAmReturnedToTheQuestionnaireDetailsPage,
  thenIGetTheDeleteSuccessBanner,
  thenIWillNotHaveTheOptionToDelete,
  thenTheQuestionnaireDataIsDeleted,
  thenTheQuestionnaireDataIsNotDeleted,
} from "../step_definitions/then";
import {
  whenICancelDelete,
  whenIConfirmDelete,
  whenIDeleteAQuestionnaire,
  whenIGoToTheQuestionnaireDetailsPage,
  whenILoadTheHomepage,
} from "../step_definitions/when";

import { createScenario } from "./nativeScenario";

import type { Questionnaire } from "blaise-api-node-client";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const questionnaireList: Questionnaire[] = [];
const mocker = new MockAdapter(axios);

describe("Feature: delete_a_questionnaire", () => {
  const Scenario = createScenario();

  beforeEach(() => {
    questionnaireList.length = 0;
  });

  afterEach(() => {
    mocker.reset();
  });

  afterAll(() => {
    mocker.restore();
  });

  Scenario("Delete an 'inactive' survey at any time", ({ Given, When, Then }) => {
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireIsInactive(Given, questionnaireList, mocker);
    givenTheQuestionnaireHasActiveSurveyDays(Given, questionnaireList, mocker);
    whenIGoToTheQuestionnaireDetailsPage(When);
    whenIDeleteAQuestionnaire(When);
    whenIConfirmDelete(When);
    thenTheQuestionnaireDataIsDeleted(Then, mocker);
    thenIGetTheDeleteSuccessBanner(Then);
  });

  Scenario("Delete a questionnaire not available from the homepage", ({ Given, When, Then }) => {
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    whenILoadTheHomepage(When);
    thenIWillNotHaveTheOptionToDelete(Then);
  });

  Scenario("Confirm deletion", ({ Given, When, Then }) => {
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    whenIGoToTheQuestionnaireDetailsPage(When);
    whenIDeleteAQuestionnaire(When);
    whenIConfirmDelete(When);
    thenTheQuestionnaireDataIsDeleted(Then, mocker);
    thenIGetTheDeleteSuccessBanner(Then);
  });

  Scenario("Cancel deletion", ({ Given, When, Then }) => {
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    whenIGoToTheQuestionnaireDetailsPage(When);
    whenIDeleteAQuestionnaire(When);
    whenICancelDelete(When);
    thenTheQuestionnaireDataIsNotDeleted(Then, mocker);
    thenIAmReturnedToTheQuestionnaireDetailsPage(Then);
  });

  Scenario("Select to delete questionnaire that is active and live", ({ Given, When, Then }) => {
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireIsActive(Given, questionnaireList, mocker);
    givenTheQuestionnaireHasActiveSurveyDays(Given, questionnaireList, mocker);
    whenIGoToTheQuestionnaireDetailsPage(When);
    whenIDeleteAQuestionnaire(When);
    thenIAmPresentedWithAnActiveSurveyDaysWarning(Then);
    whenIConfirmDelete(When);
    thenTheQuestionnaireDataIsDeleted(Then, mocker);
    thenIGetTheDeleteSuccessBanner(Then);
  });

  Scenario(
    "Select to delete questionnaire that is active and not live",
    ({ Given, When, Then }) => {
      givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
      givenTheQuestionnaireHasActiveSurveyDays(Given, questionnaireList, mocker);
      whenIGoToTheQuestionnaireDetailsPage(When);
      whenIDeleteAQuestionnaire(When);
      thenIAmPresentedWithAWarning(Then);
      whenIConfirmDelete(When);
      thenTheQuestionnaireDataIsDeleted(Then, mocker);
      thenIGetTheDeleteSuccessBanner(Then);
    },
  );

  Scenario("Select to delete questionnaire that is inactive", ({ Given, When, Then }) => {
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireIsInactive(Given, questionnaireList, mocker);
    whenIGoToTheQuestionnaireDetailsPage(When);
    whenIDeleteAQuestionnaire(When);
    whenIConfirmDelete(When);
    thenTheQuestionnaireDataIsDeleted(Then, mocker);
    thenIGetTheDeleteSuccessBanner(Then);
  });

  Scenario(
    "Select to delete questionnaire that is active and has mode set to CAWI",
    ({ Given, When, Then }) => {
      givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
      givenTheQuestionnaireIsActive(Given, questionnaireList, mocker);
      givenTheQuestionnaireHasModes(Given, mocker);
      whenIGoToTheQuestionnaireDetailsPage(When);
      whenIDeleteAQuestionnaire(When);
      thenIAmPresentedWithAnActiveWebCollectionWarning(Then);
      whenIConfirmDelete(When);
      thenTheQuestionnaireDataIsDeleted(Then, mocker);
      thenIGetTheDeleteSuccessBanner(Then);
    },
  );
});
