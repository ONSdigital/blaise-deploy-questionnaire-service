/* eslint-disable import-x/order */
/**
 * @vitest-environment jsdom
 */

// Test modules
import { defineFeature, loadFeature } from "jest-cucumber";
import "@testing-library/jest-dom";
import type { Questionnaire } from "blaise-api-node-client";

import {
  givenIHaveSelectedTheQuestionnairePackageToDeploy,
  givenTheQuestionnaireIsInstalled,
} from "../step_definitions/given";
import {
  thenIAmPresentedWithTheOptionsToCancelOrOverwrite,
  thenIAmReturnedToTheLandingPage,
} from "../step_definitions/then";
import { whenIConfirmMySelection, whenISelectTo } from "../step_definitions/when";

import axios from "axios";
import MockAdapter from "axios-mock-adapter";

// mock login
vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } =
    await import("blaise-login-react/blaise-login-react-client");

  return mockLoginReactClientModule();
});
const { MockAuthenticate } = await import("blaise-login-react/blaise-login-react-client");

MockAuthenticate.OverrideReturnValues(null, true);

// Load in feature details from .feature file
const feature = loadFeature(
  "./src/features/abandon_deployment_if_the_questionnaire_already_exists.feature",
  { tagFilter: "not @server and not @integration" },
);

const questionnaireList: Questionnaire[] = [];
const mocker = new MockAdapter(axios, { onNoMatch: "throwException" });

defineFeature(feature, (test) => {
  afterEach(() => {
    mocker.reset();
  });

  test("Questionnaire package already in Blaise", ({ given, when, then }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenIHaveSelectedTheQuestionnairePackageToDeploy(given);

    whenIConfirmMySelection(when);
    thenIAmPresentedWithTheOptionsToCancelOrOverwrite(then);
  });

  test("Back-out of deploying a questionnaire", ({ given, when, then }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenIHaveSelectedTheQuestionnairePackageToDeploy(given);

    whenIConfirmMySelection(when);
    whenISelectTo(when);
    thenIAmReturnedToTheLandingPage(then);
  });
});
