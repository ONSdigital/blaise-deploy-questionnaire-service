import "@testing-library/jest-dom";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { defineFeature, loadFeature } from "jest-cucumber";

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

import type { Questionnaire } from "blaise-api-node-client";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const feature = loadFeature(
  "./src/client/features/abandon_deployment_if_the_questionnaire_already_exists.feature",
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
