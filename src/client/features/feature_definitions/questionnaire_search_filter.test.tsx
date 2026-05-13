import "@testing-library/jest-dom/vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterEach, describe, vi } from "vitest";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import { givenTheQuestionnaireIsInstalled } from "../step_definitions/given";
import {
  thenIAmPresentedWithAListOfDeployedQuestionnaires,
  thenIAmPresentedWithQuestionnaireNotFound,
} from "../step_definitions/then";
import { whenILoadTheHomepage, whenISearchForAQuestionnaire } from "../step_definitions/when";

import { createScenario } from "./nativeScenario";

import type { Questionnaire } from "blaise-api-node-client";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const questionnaireList: Questionnaire[] = [];
const mocker = new MockAdapter(axios);

describe("Feature: questionnaire_search_filter", () => {
  const Scenario = createScenario();

  beforeEach(() => {
    questionnaireList.length = 0;
  });

  afterEach(() => {
    mocker.reset();
  });

  Scenario("Search for a questionnaire", ({ Given, When, Then }) => {
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);

    whenILoadTheHomepage(When);
    whenISearchForAQuestionnaire(When);

    thenIAmPresentedWithAListOfDeployedQuestionnaires(Then);
  });

  Scenario("Questionnaire not found", ({ Given, When, Then }) => {
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);

    whenILoadTheHomepage(When);
    whenISearchForAQuestionnaire(When);

    thenIAmPresentedWithQuestionnaireNotFound(Then);
  });

  Scenario("DST questionnaires do not show up by default", ({ Given, When, Then }) => {
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);

    whenILoadTheHomepage(When);
    whenISearchForAQuestionnaire(When);

    thenIAmPresentedWithAListOfDeployedQuestionnaires(Then);
  });

  Scenario("I can search for DST questinnaires", ({ Given, When, Then }) => {
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);

    whenILoadTheHomepage(When);
    whenISearchForAQuestionnaire(When);

    thenIAmPresentedWithAListOfDeployedQuestionnaires(Then);
  });
});
