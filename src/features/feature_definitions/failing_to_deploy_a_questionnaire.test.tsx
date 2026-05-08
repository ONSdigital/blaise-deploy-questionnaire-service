/* eslint-disable import-x/order */
/**
 * @vitest-environment jsdom
 */

// Test modules
import { defineFeature, loadFeature } from "jest-cucumber";
import "@testing-library/jest-dom";

import {
  givenAllInstallsWillFail,
  givenIHaveSelectedTheQuestionnairePackageToDeploy,
} from "../step_definitions/given";
import { thenICanRetryAnInstall, thenIGetAnErrorBanner } from "../step_definitions/then";
import { whenIConfirmMySelection, whenIDeploy } from "../step_definitions/when";

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
const feature = loadFeature("./src/features/failing_to_deploy_a_questionnaire.feature", {
  tagFilter: "not @server and not @integration",
});

const mocker = new MockAdapter(axios);

defineFeature(feature, (test) => {
  afterEach(() => {
    mocker.reset();
  });

  test("Deployment of selected file failure", ({ given, when, then }) => {
    givenAllInstallsWillFail(given, mocker);
    givenIHaveSelectedTheQuestionnairePackageToDeploy(given);

    whenIConfirmMySelection(when);
    whenIDeploy(when);

    thenIGetAnErrorBanner(then);
  });

  test("Deploy selected file, retry following failure", ({ given, when, then }) => {
    givenAllInstallsWillFail(given, mocker);
    givenIHaveSelectedTheQuestionnairePackageToDeploy(given);

    whenIConfirmMySelection(when);
    whenIDeploy(when);

    thenIGetAnErrorBanner(then);
    thenICanRetryAnInstall(then);
  });
});
