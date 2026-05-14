import "@testing-library/jest-dom/vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterAll, afterEach, describe, vi } from "vitest";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import {
  givenIHaveSelectedTheQuestionnairePackageToDeploy,
  givenTheQuestionnaireIsInstalled,
} from "../step_definitions/given";
import {
  thenIAmPresentedWithTheOptionsToCancelOrOverwrite,
  thenIAmReturnedToTheLandingPage,
} from "../step_definitions/then";
import { whenIConfirmMySelection, whenISelectTo } from "../step_definitions/when";

import { createScenario } from "./native_scenario";

import type { Questionnaire } from "blaise-api-node-client";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const questionnaireList: Questionnaire[] = [];
const mocker = new MockAdapter(axios, { onNoMatch: "throwException" });

describe("Feature: abandon_deployment_if_the_questionnaire_already_exists", () => {
  const Scenario = createScenario();

  afterEach(() => {
    mocker.reset();
  });

  afterAll(() => {
    mocker.restore();
  });

  Scenario("Questionnaire package already in Blaise", ({ Given, When, Then }) => {
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenIHaveSelectedTheQuestionnairePackageToDeploy(Given);

    whenIConfirmMySelection(When);
    thenIAmPresentedWithTheOptionsToCancelOrOverwrite(Then);
  });

  Scenario("Back-out of deploying a questionnaire", ({ Given, When, Then }) => {
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenIHaveSelectedTheQuestionnairePackageToDeploy(Given);

    whenIConfirmMySelection(When);
    whenISelectTo(When);
    thenIAmReturnedToTheLandingPage(Then);
  });
});
