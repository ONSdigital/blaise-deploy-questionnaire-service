import "@testing-library/jest-dom";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { defineFeature, loadFeature } from "jest-cucumber";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import { givenTheQuestionnaireIsInstalled } from "../step_definitions/given";
import {
  thenIAmPresentedWithAListOfDeployedQuestionnaires,
  thenIAmPresentedWithQuestionnaireNotFound,
} from "../step_definitions/then";
import { whenILoadTheHomepage, whenISearchForAQuestionnaire } from "../step_definitions/when";

import type { Questionnaire } from "blaise-api-node-client";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const feature = loadFeature("./src/client/features/questionnaire_search_filter.feature", {
  tagFilter: "not @server and not @integration",
});

const questionnaireList: Questionnaire[] = [];
const mocker = new MockAdapter(axios);

defineFeature(feature, (test) => {
  beforeEach(() => {
    questionnaireList.length = 0;
  });

  afterEach(() => {
    mocker.reset();
  });

  test("Search for a questionnaire", ({ given, when, then }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);

    whenILoadTheHomepage(when);
    whenISearchForAQuestionnaire(when);

    thenIAmPresentedWithAListOfDeployedQuestionnaires(then);
  });

  test("Questionnaire not found", ({ given, when, then }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);

    whenILoadTheHomepage(when);
    whenISearchForAQuestionnaire(when);

    thenIAmPresentedWithQuestionnaireNotFound(then);
  });

  test("DST questionnaires do not show up by default", ({ given, when, then }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);

    whenILoadTheHomepage(when);
    whenISearchForAQuestionnaire(when);

    thenIAmPresentedWithAListOfDeployedQuestionnaires(then);
  });

  test("I can search for DST questinnaires", ({ given, when, then }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);

    whenILoadTheHomepage(when);
    whenISearchForAQuestionnaire(when);

    thenIAmPresentedWithAListOfDeployedQuestionnaires(then);
  });
});
