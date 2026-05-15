import "@testing-library/jest-dom/vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterAll, afterEach, describe, vi } from "vitest";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import { createScenario } from "../feature_scenario_runner";
import { givenQuestionnaireInstalled } from "../step_definitions/given";
import { thenDeployedListShown, thenQuestionnaireNotFound } from "../step_definitions/then";
import { whenLoadHomepage, whenSearchForQuestionnaire } from "../step_definitions/when";

import type { Questionnaire } from "blaise-api-node-client";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const questionnaireList: Questionnaire[] = [];
const mocker = new MockAdapter(axios, { onNoMatch: "throwException" });
const searchDataset = ["DST9999A", "DST8888B", "DST2108A", "DST2108B", "DST2108C", "FOO1234Z"];

describe("Feature: questionnaire_search_filter", () => {
  const Scenario = createScenario({ installedQuestionnaires: searchDataset });

  beforeEach(() => {
    questionnaireList.length = 0;
  });

  afterEach(() => {
    mocker.reset();
  });

  afterAll(() => {
    mocker.restore();
  });

  Scenario(
    {
      name: "Search for a questionnaire",
      args: {
        questionnaireTable: [{ Questionnaire: "DST2108C" }],
        searchValue: "DST2108C",
      },
    },
    ({ Given, When, Then }) => {
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      whenLoadHomepage(When);
      whenSearchForQuestionnaire(When);
      thenDeployedListShown(Then);
    },
  );

  Scenario(
    {
      name: "Questionnaire not found",
      args: {
        message: "No questionnaires containing BAR1234K found",
        searchValue: "BAR1234K",
      },
    },
    ({ Given, When, Then }) => {
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      whenLoadHomepage(When);
      whenSearchForQuestionnaire(When);
      thenQuestionnaireNotFound(Then);
    },
  );

  Scenario(
    {
      name: "DST questionnaires do not show up by default",
      args: {
        questionnaireTable: [{ Questionnaire: "FOO1234Z" }],
        searchValue: "",
      },
    },
    ({ Given, When, Then }) => {
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      whenLoadHomepage(When);
      whenSearchForQuestionnaire(When);
      thenDeployedListShown(Then);
    },
  );

  Scenario(
    {
      name: "I can search for DST questinnaires",
      args: {
        questionnaireTable: [
          { Questionnaire: "DST9999A" },
          { Questionnaire: "DST8888B" },
          { Questionnaire: "DST2108A" },
          { Questionnaire: "DST2108B" },
          { Questionnaire: "DST2108C" },
        ],
        searchValue: "DST",
      },
    },
    ({ Given, When, Then }) => {
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      whenLoadHomepage(When);
      whenSearchForQuestionnaire(When);
      thenDeployedListShown(Then);
    },
  );
});
