import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterAll, afterEach, describe, vi } from "vitest";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import {
  givenQuestionnaireHasToStartDate,
  givenQuestionnaireHasNoToStartDate,
  givenQuestionnaireInstalled,
} from "../step_definitions/given";
import {
  thenToStartDateShown,
  thenAddToStartDateOption,
  thenChangeOrDeleteToStartDateOption,
  thenToStartDateDeleted,
  thenToStartDateStored,
} from "../step_definitions/then";
import {
  whenDeleteToStartDate,
  whenAddToStartDate,
  whenLoadHomepage,
  whenClickContinue,
  whenSelectQuestionnaire,
  whenEditToStartDate,
  whenSpecifyToStartDate,
} from "../step_definitions/when";

import { createScenario } from "./native_scenario";

import type { Questionnaire } from "blaise-api-node-client";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const questionnaireList: Questionnaire[] = [];
const mocker = new MockAdapter(axios, { onNoMatch: "throwException" });

describe("Feature: edit_telephone_operations_start_date", () => {
  const Scenario = createScenario();

  afterEach(() => {
    mocker.reset();
  });

  afterAll(() => {
    mocker.restore();
  });

  Scenario("View Telephone Operations start date if specified", ({ Given, When, Then }) => {
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    givenQuestionnaireHasToStartDate(Given, mocker);
    whenLoadHomepage(When);
    whenSelectQuestionnaire(When);
    thenToStartDateShown(Then);
  });

  Scenario("Change Telephone Operations start date if specified", ({ Given, When, Then }) => {
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    givenQuestionnaireHasToStartDate(Given, mocker);
    whenLoadHomepage(When);
    whenSelectQuestionnaire(When);
    thenChangeOrDeleteToStartDateOption(Then);
  });

  Scenario("Add Telephone Operations start date if not previously specified", ({ Given, When, Then }) => {
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    givenQuestionnaireHasNoToStartDate(Given, mocker);
    whenLoadHomepage(When);
    whenSelectQuestionnaire(When);
    thenAddToStartDateOption(Then);
  });

  Scenario(
    "Change an existing Telephone Operations start date for a deployed questionnaire",
    ({ Given, When, Then }) => {
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenQuestionnaireHasToStartDate(Given, mocker);
      whenLoadHomepage(When);
      whenSelectQuestionnaire(When);
      whenEditToStartDate(When);
      whenSpecifyToStartDate(When);
      whenClickContinue(When);
      thenToStartDateStored(Then, mocker);
    },
  );

  Scenario("Delete a Telephone Operations start date from a deployed questionnaire", ({ Given, When, Then }) => {
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    givenQuestionnaireHasToStartDate(Given, mocker);
    whenLoadHomepage(When);
    whenSelectQuestionnaire(When);
    whenEditToStartDate(When);
    whenDeleteToStartDate(When);
    whenClickContinue(When);
    thenToStartDateDeleted(Then, mocker);
  });

  Scenario("Add a Telephone Operations start date to a deployed questionnaire", ({ Given, When, Then }) => {
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    givenQuestionnaireHasNoToStartDate(Given, mocker);
    whenLoadHomepage(When);
    whenSelectQuestionnaire(When);
    whenAddToStartDate(When);
    whenSpecifyToStartDate(When);
    whenClickContinue(When);
    thenToStartDateStored(Then, mocker);
  });
});
