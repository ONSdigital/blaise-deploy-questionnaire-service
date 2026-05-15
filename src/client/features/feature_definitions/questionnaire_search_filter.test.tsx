import "@testing-library/jest-dom/vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterAll, afterEach, describe, vi } from "vitest";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import { givenQuestionnaireInstalled } from "../step_definitions/given";
import {
  thenDeployedListShown,
  thenQuestionnaireNotFound,
} from "../step_definitions/then";
import { whenLoadHomepage, whenSearchForQuestionnaire } from "../step_definitions/when";

import { createScenario } from "./native_scenario";

import type { Questionnaire } from "blaise-api-node-client";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const questionnaireList: Questionnaire[] = [];
const mocker = new MockAdapter(axios, { onNoMatch: "throwException" });

describe("Feature: questionnaire_search_filter", () => {
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

  Scenario("Search for a questionnaire", ({ Given, When, Then }) => {
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    whenLoadHomepage(When);
    whenSearchForQuestionnaire(When);
    thenDeployedListShown(Then);
  });

  Scenario("Questionnaire not found", ({ Given, When, Then }) => {
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    whenLoadHomepage(When);
    whenSearchForQuestionnaire(When);
    thenQuestionnaireNotFound(Then);
  });

  Scenario("DST questionnaires do not show up by default", ({ Given, When, Then }) => {
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    whenLoadHomepage(When);
    whenSearchForQuestionnaire(When);
    thenDeployedListShown(Then);
  });

  Scenario("I can search for DST questinnaires", ({ Given, When, Then }) => {
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    whenLoadHomepage(When);
    whenSearchForQuestionnaire(When);
    thenDeployedListShown(Then);
  });
});
