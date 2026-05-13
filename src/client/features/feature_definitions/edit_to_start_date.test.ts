import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterAll, afterEach, describe, vi } from "vitest";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import {
  givenTheQuestionnaireHasAToStartDate,
  givenTheQuestionnaireHasNoToStartDate,
  givenTheQuestionnaireIsInstalled,
} from "../step_definitions/given";
import {
  thenICanViewTheTOStartDateIsSetTo,
  thenIHaveTheOptionToAddAToStartDate,
  thenIHaveTheOptionToChangeOrDeleteTheToStartDate,
  thenTheToStartDateIsDeleted,
  thenTheToStartDateIsStored,
} from "../step_definitions/then";
import {
  whenIDeleteTheToStartDate,
  whenIHaveSelectedToAddAToStartDate,
  whenILoadTheHomepage,
  whenISelectTheContinueButton,
  whenISelectTheQuestionnaire,
  whenISelectToChangeOrDeleteToStartDate,
  whenISpecifyATOStartDateOf,
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

describe("Feature: edit_to_start_date", () => {
  const Scenario = createScenario();

  afterEach(() => {
    mocker.reset();
  });

  afterAll(() => {
    mocker.restore();
  });

  Scenario("View TO Start Date if specified", ({ Given, When, Then }) => {
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireHasAToStartDate(Given, mocker);

    whenILoadTheHomepage(When);
    whenISelectTheQuestionnaire(When);

    thenICanViewTheTOStartDateIsSetTo(Then);
  });

  Scenario("Change TO Start Date if specified", ({ Given, When, Then }) => {
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireHasAToStartDate(Given, mocker);

    whenILoadTheHomepage(When);
    whenISelectTheQuestionnaire(When);

    thenIHaveTheOptionToChangeOrDeleteTheToStartDate(Then);
  });

  Scenario("Add TO Start Date if not previously specified", ({ Given, When, Then }) => {
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireHasNoToStartDate(Given, mocker);

    whenILoadTheHomepage(When);
    whenISelectTheQuestionnaire(When);

    thenIHaveTheOptionToAddAToStartDate(Then);
  });

  Scenario(
    "Change an existing TO Start Date for a deployed questionnaire",
    ({ Given, When, Then }) => {
      givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
      givenTheQuestionnaireHasAToStartDate(Given, mocker);

      whenILoadTheHomepage(When);
      whenISelectTheQuestionnaire(When);
      whenISelectToChangeOrDeleteToStartDate(When);
      whenISpecifyATOStartDateOf(When);
      whenISelectTheContinueButton(When);

      thenTheToStartDateIsStored(Then, mocker);
    },
  );

  Scenario("Delete a TO start date from a deployed questionnaire", ({ Given, When, Then }) => {
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireHasAToStartDate(Given, mocker);

    whenILoadTheHomepage(When);
    whenISelectTheQuestionnaire(When);
    whenISelectToChangeOrDeleteToStartDate(When);
    whenIDeleteTheToStartDate(When);
    whenISelectTheContinueButton(When);

    thenTheToStartDateIsDeleted(Then, mocker);
  });

  Scenario("Add a TO Start Date to a deployed questionnaire", ({ Given, When, Then }) => {
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireHasNoToStartDate(Given, mocker);

    whenILoadTheHomepage(When);
    whenISelectTheQuestionnaire(When);
    whenIHaveSelectedToAddAToStartDate(When);
    whenISpecifyATOStartDateOf(When);
    whenISelectTheContinueButton(When);

    thenTheToStartDateIsStored(Then, mocker);
  });
});
