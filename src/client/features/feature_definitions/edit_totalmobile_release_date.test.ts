import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterAll, afterEach, describe, vi } from "vitest";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import { createScenario } from "../feature_scenario_runner";
import {
  givenQuestionnaireHasNoTmReleaseDate,
  givenQuestionnaireHasTmReleaseDate,
  givenQuestionnaireInstalled,
} from "../step_definitions/given";
import {
  thenAddTmReleaseDateOption,
  thenChangeOrDeleteTmReleaseDateOption,
  thenTmReleaseDateDeleted,
  thenTmReleaseDateShown,
  thenTmReleaseDateStored,
} from "../step_definitions/then";
import {
  whenAddTmReleaseDate,
  whenClickContinue,
  whenDeleteTmReleaseDate,
  whenEditTmReleaseDate,
  whenLoadHomepage,
  whenSelectQuestionnaire,
  whenSpecifyTmReleaseDate,
} from "../step_definitions/when";

import type { Questionnaire } from "blaise-api-node-client";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const questionnaireList: Questionnaire[] = [];
const mocker = new MockAdapter(axios, { onNoMatch: "throwException" });

describe("Feature: edit_totalmobile_release_date", () => {
  const Scenario = createScenario({ date: "05/06/2030", questionnaireName: "LMS2101A" });

  afterEach(() => {
    mocker.reset();
  });

  afterAll(() => {
    mocker.restore();
  });

  Scenario("View Totalmobile release date if specified", ({ Given, When, Then }) => {
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    givenQuestionnaireHasTmReleaseDate(Given, mocker);
    whenLoadHomepage(When);
    whenSelectQuestionnaire(When);
    thenTmReleaseDateShown(Then);
  });

  Scenario("Change Totalmobile release date if specified", ({ Given, When, Then }) => {
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    givenQuestionnaireHasTmReleaseDate(Given, mocker);
    whenLoadHomepage(When);
    whenSelectQuestionnaire(When);
    thenChangeOrDeleteTmReleaseDateOption(Then);
  });

  Scenario("Add Totalmobile release date if not previously specified", ({ Given, When, Then }) => {
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    givenQuestionnaireHasNoTmReleaseDate(Given, mocker);
    whenLoadHomepage(When);
    whenSelectQuestionnaire(When);
    thenAddTmReleaseDateOption(Then);
  });

  Scenario(
    "Change an existing Totalmobile release date for a deployed questionnaire",
    ({ Given, When, Then }) => {
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenQuestionnaireHasTmReleaseDate(Given, mocker);
      whenLoadHomepage(When);
      whenSelectQuestionnaire(When);
      whenEditTmReleaseDate(When);
      whenSpecifyTmReleaseDate(When);
      whenClickContinue(When);
      thenTmReleaseDateStored(Then, mocker);
    },
  );

  Scenario(
    "Delete a Totalmobile release date from a deployed questionnaire",
    ({ Given, When, Then }) => {
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenQuestionnaireHasTmReleaseDate(Given, mocker);
      whenLoadHomepage(When);
      whenSelectQuestionnaire(When);
      whenEditTmReleaseDate(When);
      whenDeleteTmReleaseDate(When);
      whenClickContinue(When);
      thenTmReleaseDateDeleted(Then, mocker);
    },
  );

  Scenario(
    "Add a Totalmobile release date to a deployed questionnaire",
    ({ Given, When, Then }) => {
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenQuestionnaireHasNoTmReleaseDate(Given, mocker);
      whenLoadHomepage(When);
      whenSelectQuestionnaire(When);
      whenAddTmReleaseDate(When);
      whenSpecifyTmReleaseDate(When);
      whenClickContinue(When);
      thenTmReleaseDateStored(Then, mocker);
    },
  );
});
