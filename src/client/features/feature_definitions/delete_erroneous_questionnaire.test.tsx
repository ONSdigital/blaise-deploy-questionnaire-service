import "@testing-library/jest-dom/vitest";
import axios from "axios";
import Mockadapter from "axios-mock-adapter";
import { afterAll, afterEach, beforeEach, describe, vi } from "vitest";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import {
  givenQuestionnaireIsErroneous,
  givenQuestionnaireInstalled,
} from "../step_definitions/given";
import {
  thenUnableToDeleteWarning,
  thenCannotDeleteQuestionnaire,
  thenCanReturnToList,
} from "../step_definitions/then";
import {
  whenClickDelete,
  whenGoToDetailsPage,
} from "../step_definitions/when";

import { createScenario } from "./native_scenario";

import type { Questionnaire } from "blaise-api-node-client";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const questionnaireList: Questionnaire[] = [];
const mocker = new Mockadapter(axios, { onNoMatch: "throwException" });

describe("Feature: delete_erroneous_questionnaire", () => {
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

  Scenario(
    "Delete erroneous questionnaire",
    ({ Given, When, Then }) => {
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenQuestionnaireIsErroneous(Given, questionnaireList);
      whenGoToDetailsPage(When);
      whenClickDelete(When);
      thenUnableToDeleteWarning(Then);
      thenCannotDeleteQuestionnaire(Then);
      thenCanReturnToList(Then);
    },
  );
});
