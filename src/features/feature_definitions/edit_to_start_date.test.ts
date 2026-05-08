/**
 * @vitest-environment jsdom
 */

import axios from "axios";
import MockAdapeter from "axios-mock-adapter";
import type { Questionnaire } from "blaise-api-node-client";
import { defineFeature, loadFeature } from "jest-cucumber";

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

// mock login
vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } =
    await import("blaise-login-react/blaise-login-react-client");

  return mockLoginReactClientModule();
});
const { MockAuthenticate } = await import("blaise-login-react/blaise-login-react-client");

MockAuthenticate.OverrideReturnValues(null, true);

const feature = loadFeature("./src/features/edit_to_start_date.feature", {
  tagFilter: "not @server and not @integration",
});

const questionnaireList: Questionnaire[] = [];
const mocker = new MockAdapeter(axios);

defineFeature(feature, (test) => {
  afterEach(() => {
    mocker.reset();
  });

  test("View TO Start Date if specified", ({ given, when, then }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireHasAToStartDate(given, mocker);

    whenILoadTheHomepage(when);
    whenISelectTheQuestionnaire(when);

    thenICanViewTheTOStartDateIsSetTo(then);
  });

  test("Change TO Start Date if specified", ({ given, when, then }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireHasAToStartDate(given, mocker);

    whenILoadTheHomepage(when);
    whenISelectTheQuestionnaire(when);

    thenIHaveTheOptionToChangeOrDeleteTheToStartDate(then);
  });

  test("Add TO Start Date if not previously specified", ({ given, when, then }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireHasNoToStartDate(given, mocker);

    whenILoadTheHomepage(when);
    whenISelectTheQuestionnaire(when);

    thenIHaveTheOptionToAddAToStartDate(then);
  });

  test("Change an existing TO Start Date for a deployed questionnaire", ({ given, when, then }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireHasAToStartDate(given, mocker);

    whenILoadTheHomepage(when);
    whenISelectTheQuestionnaire(when);
    whenISelectToChangeOrDeleteToStartDate(when);
    whenISpecifyATOStartDateOf(when);
    whenISelectTheContinueButton(when);

    thenTheToStartDateIsStored(then, mocker);
  });

  test("Delete a TO start date from a deployed questionnaire", ({ given, when, then }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireHasAToStartDate(given, mocker);

    whenILoadTheHomepage(when);
    whenISelectTheQuestionnaire(when);
    whenISelectToChangeOrDeleteToStartDate(when);
    whenIDeleteTheToStartDate(when);
    whenISelectTheContinueButton(when);

    thenTheToStartDateIsDeleted(then, mocker);
  });

  test("Add a TO Start Date to a deployed questionnaire", ({ given, when, then }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireHasNoToStartDate(given, mocker);

    whenILoadTheHomepage(when);
    whenISelectTheQuestionnaire(when);
    whenIHaveSelectedToAddAToStartDate(when);
    whenISpecifyATOStartDateOf(when);
    whenISelectTheContinueButton(when);

    thenTheToStartDateIsStored(then, mocker);
  });
});
