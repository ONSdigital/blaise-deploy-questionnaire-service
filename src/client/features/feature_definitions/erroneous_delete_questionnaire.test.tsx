import "@testing-library/jest-dom/vitest";
import axios from "axios";
import Mockadapter from "axios-mock-adapter";
import { afterAll, afterEach, beforeEach, describe, vi } from "vitest";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import {
  givenTheQuestionnaireCannotBeDeletedBecauseItWillGoErroneous,
  givenTheQuestionnaireIsErroneous,
  givenTheQuestionnaireIsInstalled,
} from "../step_definitions/given";
import {
  thenIAmPresentedWithACannotDeleteWarning,
  thenIAmPresentedWithAUnableDeleteWarning,
  thenIAmUnableToDeleteTheQuestionnaire,
  thenICanReturnToTheQuestionnaireList,
} from "../step_definitions/then";
import {
  whenIConfirmDelete,
  whenIDeleteAQuestionnaire,
  whenIGoToTheQuestionnaireDetailsPage,
} from "../step_definitions/when";

import { createScenario } from "./native_scenario";

import type { Questionnaire } from "blaise-api-node-client";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const questionnaireList: Questionnaire[] = [];
const mocker = new Mockadapter(axios);

describe("Feature: erroneous_delete_questionnaire", () => {
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
    "Attempt to delete an questionnaire with an erroneous status",
    ({ Given, When, Then }) => {
      givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
      givenTheQuestionnaireIsErroneous(Given, questionnaireList);
      whenIGoToTheQuestionnaireDetailsPage(When);
      whenIDeleteAQuestionnaire(When);
      thenIAmPresentedWithAUnableDeleteWarning(Then);
      thenIAmUnableToDeleteTheQuestionnaire(Then);
      thenICanReturnToTheQuestionnaireList(Then);
    },
  );

  Scenario("Select to deploy a new questionnaire", ({ Given, When, Then }) => {
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireCannotBeDeletedBecauseItWillGoErroneous(Given, mocker);
    whenIGoToTheQuestionnaireDetailsPage(When);
    whenIDeleteAQuestionnaire(When);
    whenIConfirmDelete(When);
    thenIAmPresentedWithACannotDeleteWarning(Then);
  });
});
