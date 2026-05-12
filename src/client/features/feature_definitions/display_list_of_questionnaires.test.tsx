import "@testing-library/jest-dom";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { defineFeature, loadFeature } from "jest-cucumber";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import { givenTheQuestionnaireIsInstalled } from "../step_definitions/given";
import { thenIAmPresentedWithAListOfDeployedQuestionnaires } from "../step_definitions/then";
import { whenILoadTheHomepage } from "../step_definitions/when";

import type { Questionnaire } from "blaise-api-node-client";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const feature = loadFeature("./src/client/features/display_list_of_questionnaires.feature", {
  tagFilter: "not @server and not @integration",
});

const questionnaireList: Questionnaire[] = [];
const mocker = new MockAdapter(axios);

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
