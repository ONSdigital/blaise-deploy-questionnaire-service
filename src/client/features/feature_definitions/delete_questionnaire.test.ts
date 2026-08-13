import "@testing-library/jest-dom/vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterAll, afterEach, describe, vi } from "vitest";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import { createScenario } from "../feature_scenario_runner";
import {
  givenQuestionnaireHasActiveSurveyDays,
  givenQuestionnaireHasModes,
  givenQuestionnaireInstalled,
  givenQuestionnaireIsActive,
  givenQuestionnaireIsInactive,
} from "../step_definitions/given";
import {
  thenActiveSurveyDaysWarning,
  thenActiveWebCollectionWarning,
  thenDeleteSuccessBanner,
  thenDeleteWarning,
  thenNoDeleteOption,
  thenQuestionnaireDeleted,
  thenQuestionnaireNotDeleted,
  thenReturnedToDetailsPage,
} from "../step_definitions/then";
import {
  whenCancelDeletion,
  whenClickDelete,
  whenConfirmDeletion,
  whenGoToDetailsPage,
  whenLoadHomepage,
} from "../step_definitions/when";

import type { Questionnaire } from "blaise-api-node-client";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const questionnaireList: Questionnaire[] = [];
const mocker = new MockAdapter(axios, { onNoMatch: "throwException" });

describe("Feature: delete_questionnaire", () => {
  const Scenario = createScenario({ questionnaireName: "OPN2004A" });

  beforeEach(() => {
    questionnaireList.length = 0;
  });

  afterEach(() => {
    mocker.reset();
  });

  afterAll(() => {
    mocker.restore();
  });

  Scenario("Delete questionnaire not shown on questionnaires page", ({ Given, When, Then }) => {
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    whenLoadHomepage(When);
    thenNoDeleteOption(Then);
  });

  Scenario("Cancel deletion", ({ Given, When, Then }) => {
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    whenGoToDetailsPage(When);
    whenClickDelete(When);
    whenCancelDeletion(When);
    thenQuestionnaireNotDeleted(Then, mocker);
    thenReturnedToDetailsPage(Then);
  });

  Scenario("Delete active questionnaire with survey days", ({ Given, When, Then }) => {
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    givenQuestionnaireIsActive(Given, questionnaireList, mocker);
    givenQuestionnaireHasActiveSurveyDays(Given, questionnaireList, mocker);
    whenGoToDetailsPage(When);
    whenClickDelete(When);
    thenActiveSurveyDaysWarning(Then);
    whenConfirmDeletion(When);
    thenQuestionnaireDeleted(Then, mocker);
    thenDeleteSuccessBanner(Then);
  });

  Scenario("Delete questionnaire with survey days", ({ Given, When, Then }) => {
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    givenQuestionnaireHasActiveSurveyDays(Given, questionnaireList, mocker);
    whenGoToDetailsPage(When);
    whenClickDelete(When);
    thenDeleteWarning(Then);
    whenConfirmDeletion(When);
    thenQuestionnaireDeleted(Then, mocker);
    thenDeleteSuccessBanner(Then);
  });

  Scenario("Delete inactive questionnaire", ({ Given, When, Then }) => {
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    givenQuestionnaireIsInactive(Given, questionnaireList, mocker);
    whenGoToDetailsPage(When);
    whenClickDelete(When);
    whenConfirmDeletion(When);
    thenQuestionnaireDeleted(Then, mocker);
    thenDeleteSuccessBanner(Then);
  });

  Scenario(
    {
      name: "Delete CAWI questionnaire",
      args: { modes: "CAWI" },
    },
    ({ Given, When, Then }) => {
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenQuestionnaireIsActive(Given, questionnaireList, mocker);
      givenQuestionnaireHasModes(Given, mocker);
      whenGoToDetailsPage(When);
      whenClickDelete(When);
      thenActiveWebCollectionWarning(Then);
      whenConfirmDeletion(When);
      thenQuestionnaireDeleted(Then, mocker);
      thenDeleteSuccessBanner(Then);
    },
  );
});
