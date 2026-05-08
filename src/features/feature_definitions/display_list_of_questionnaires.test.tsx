/* eslint-disable import-x/order */
/**
 * @vitest-environment jsdom
 */

// Test modules
import { defineFeature, loadFeature } from "jest-cucumber";
import "@testing-library/jest-dom";
// Mock elements
import type { Questionnaire } from "blaise-api-node-client";

import { givenTheQuestionnaireIsInstalled } from "../step_definitions/given";
import { thenIAmPresentedWithAListOfDeployedQuestionnaires } from "../step_definitions/then";
import { whenILoadTheHomepage } from "../step_definitions/when";

import axios from "axios";
import MockAdapeter from "axios-mock-adapter";

// mock login
vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } =
    await import("blaise-login-react/blaise-login-react-client");

  return mockLoginReactClientModule();
});
const { MockAuthenticate } = await import("blaise-login-react/blaise-login-react-client");

MockAuthenticate.OverrideReturnValues(null, true);

// Load in feature details from .feature file
const feature = loadFeature("./src/features/display_list_of_questionnaires.feature", {
  tagFilter: "not @server and not @integration",
});

const questionnaireList: Questionnaire[] = [];
const mocker = new MockAdapeter(axios);

defineFeature(feature, (test) => {
  afterEach(() => {
    mocker.reset();
  });

  test("List all questionnaires in Blaise", ({ given, when, then }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    whenILoadTheHomepage(when);
    thenIAmPresentedWithAListOfDeployedQuestionnaires(then);
  });
});
