import "@testing-library/jest-dom/vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterAll, afterEach, describe, vi } from "vitest";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import { createScenario } from "../feature_scenario_runner";
import { givenQuestionnaireInstalled } from "../step_definitions/given";
import { thenDeployedListShown } from "../step_definitions/then";
import { whenLoadHomepage } from "../step_definitions/when";

import type { Questionnaire } from "blaise-api-node-client";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const questionnaireList: Questionnaire[] = [];
const mocker = new MockAdapter(axios, { onNoMatch: "throwException" });

describe("Feature: list_deployed_questionnaires", () => {
  const Scenario = createScenario({
    questionnaireName: "OPN2004A",
    questionnaireTable: [{ Questionnaire: "OPN2004A" }],
  });

  afterEach(() => {
    mocker.reset();
  });

  afterAll(() => {
    mocker.restore();
  });

  Scenario("List deployed questionnaires", ({ Given, When, Then }) => {
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    whenLoadHomepage(When);
    thenDeployedListShown(Then);
  });
});
