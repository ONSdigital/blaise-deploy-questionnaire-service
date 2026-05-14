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
  thenICanViewTheToStartDateIsSetTo,
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
  whenISpecifyAToStartDateOf,
} from "../step_definitions/when";

import { createScenario } from "./native_scenario";

import type { Questionnaire } from "blaise-api-node-client";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const questionnaireList: Questionnaire[] = [];
const mocker = new MockAdapter(axios);

describe("Feature: edit_telephone_operations_start_date", () => {
  const Scenario = createScenario();

  afterEach(() => {
    mocker.reset();
  });

  afterAll(() => {
    mocker.restore();
  });

  Scenario("View Telephone Operations start date if specified", ({ Given, When, Then }) => {
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireHasAToStartDate(Given, mocker);

    whenILoadTheHomepage(When);
    whenISelectTheQuestionnaire(When);

    thenICanViewTheToStartDateIsSetTo(Then);
  });

  Scenario("Change Telephone Operations start date if specified", ({ Given, When, Then }) => {
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireHasAToStartDate(Given, mocker);

    whenILoadTheHomepage(When);
    whenISelectTheQuestionnaire(When);

    thenIHaveTheOptionToChangeOrDeleteTheToStartDate(Then);
  });

  Scenario("Add Telephone Operations start date if not previously specified", ({ Given, When, Then }) => {
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireHasNoToStartDate(Given, mocker);

    whenILoadTheHomepage(When);
    whenISelectTheQuestionnaire(When);

    thenIHaveTheOptionToAddAToStartDate(Then);
  });

  Scenario(
    "Change an existing Telephone Operations start date for a deployed questionnaire",
    ({ Given, When, Then }) => {
      givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
      givenTheQuestionnaireHasAToStartDate(Given, mocker);

      whenILoadTheHomepage(When);
      whenISelectTheQuestionnaire(When);
      whenISelectToChangeOrDeleteToStartDate(When);
      whenISpecifyAToStartDateOf(When);
      whenISelectTheContinueButton(When);

      thenTheToStartDateIsStored(Then, mocker);
    },
  );

  Scenario("Delete a Telephone Operations start date from a deployed questionnaire", ({ Given, When, Then }) => {
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireHasAToStartDate(Given, mocker);

    whenILoadTheHomepage(When);
    whenISelectTheQuestionnaire(When);
    whenISelectToChangeOrDeleteToStartDate(When);
    whenIDeleteTheToStartDate(When);
    whenISelectTheContinueButton(When);

    thenTheToStartDateIsDeleted(Then, mocker);
  });

  Scenario("Add a Telephone Operations start date to a deployed questionnaire", ({ Given, When, Then }) => {
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireHasNoToStartDate(Given, mocker);

    whenILoadTheHomepage(When);
    whenISelectTheQuestionnaire(When);
    whenIHaveSelectedToAddAToStartDate(When);
    whenISpecifyAToStartDateOf(When);
    whenISelectTheContinueButton(When);

    thenTheToStartDateIsStored(Then, mocker);
  });
});
