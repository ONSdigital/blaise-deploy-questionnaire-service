/* eslint-disable import-x/order */
/**
 * @vitest-environment jsdom
 */

// Test modules
import { defineFeature, loadFeature } from "jest-cucumber";
import "@testing-library/jest-dom";
// Mock elements
import type { Questionnaire } from "blaise-api-node-client";

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

import axios from "axios";
import Mockadapter from "axios-mock-adapter";

// mock login
vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } =
    await import("blaise-login-react/blaise-login-react-client");

  return mockLoginReactClientModule();
});
const { MockAuthenticate } = await import("blaise-login-react/blaise-login-react-client");

MockAuthenticate.OverrideReturnValues(null, true);

// Load in feature details from .feature file
const feature = loadFeature("./src/features/erroneous_delete_questionnaire.feature", {
  tagFilter: "not @server and not @integration",
});

const questionnaireList: Questionnaire[] = [];
const mocker = new Mockadapter(axios);

defineFeature(feature, (test) => {
  afterEach(() => {
    mocker.reset();
  });

  test("Attempt to delete an questionnaire with an erroneous status", ({ given, when, then }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireIsErroneous(given, questionnaireList);
    whenIGoToTheQuestionnaireDetailsPage(when);
    whenIDeleteAQuestionnaire(when);
    thenIAmPresentedWithAUnableDeleteWarning(then);
    thenIAmUnableToDeleteTheQuestionnaire(then);
    thenICanReturnToTheQuestionnaireList(then);
  });

  test("Select to deploy a new questionnaire", ({ given, when, then }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireCannotBeDeletedBecauseItWillGoErroneous(when, mocker);
    whenIGoToTheQuestionnaireDetailsPage(when);
    whenIDeleteAQuestionnaire(when);
    whenIConfirmDelete(when);
    thenIAmPresentedWithACannotDeleteWarning(then);
  });
});
