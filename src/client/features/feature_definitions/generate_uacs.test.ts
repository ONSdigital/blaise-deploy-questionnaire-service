import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterAll, afterEach, describe, vi } from "vitest";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import { createScenario } from "../feature_scenario_runner";
import {
  givenQuestionnaireHasCases,
  givenQuestionnaireHasModes,
  givenQuestionnaireHasUacs,
  givenQuestionnaireInstalled,
  givenUacGenerationFails,
} from "../step_definitions/given";
import {
  thenCasesDisplayed,
  thenGenerateUacAvailable,
  thenGenerateUacNotAvailable,
  thenUacError,
  thenUacsGenerated,
} from "../step_definitions/then";
import { whenClickGenerateUacs, whenGoToDetailsPage } from "../step_definitions/when";

import type { Questionnaire } from "blaise-api-node-client";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const questionnaireList: Questionnaire[] = [];
const mocker = new MockAdapter(axios, { onNoMatch: "throwException" });

describe("Feature: generate_uacs", () => {
  const Scenario = createScenario({ cases: "500", questionnaireName: "OPN2004A" });

  beforeEach(() => {
    globalThis.URL.createObjectURL = vi.fn();
  });

  afterEach(() => {
    mocker.reset();
  });

  afterAll(() => {
    mocker.restore();
  });

  Scenario(
    {
      name: "Generate button exists for questionnaires with CAWI mode and cases",
      args: { modes: "CAWI" },
    },
    ({ Given, When, Then }) => {
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenQuestionnaireHasModes(Given, mocker);
      givenQuestionnaireHasCases(Given, questionnaireList, mocker);
      whenGoToDetailsPage(When);
      thenGenerateUacAvailable(Then);
    },
  );

  Scenario(
    {
      name: "Generate button does not exist for questionnaires in CAWI mode without cases",
      args: { modes: "CAWI", cases: "0" },
    },
    ({ Given, When, Then }) => {
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenQuestionnaireHasModes(Given, mocker);
      givenQuestionnaireHasCases(Given, questionnaireList, mocker);
      whenGoToDetailsPage(When);
      thenGenerateUacNotAvailable(Then);
    },
  );

  Scenario(
    {
      name: "Generate button does not exist for questionnaires in CATI mode with cases",
      args: { modes: "CATI" },
    },
    ({ Given, When, Then }) => {
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenQuestionnaireHasModes(Given, mocker);
      givenQuestionnaireHasCases(Given, questionnaireList, mocker);
      whenGoToDetailsPage(When);
      thenGenerateUacNotAvailable(Then);
    },
  );

  Scenario(
    {
      name: "I get a confirmation message When generating Unique Access Codes",
      args: { modes: "CAWI" },
    },
    ({ Given, When, Then }) => {
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenQuestionnaireHasModes(Given, mocker);
      givenQuestionnaireHasCases(Given, questionnaireList, mocker);
      whenGoToDetailsPage(When);
      whenClickGenerateUacs(When);
      thenUacsGenerated(Then, mocker);
    },
  );

  Scenario(
    {
      name: "I get a error message When generating Unique Access Codes",
      args: { modes: "CAWI" },
    },
    ({ Given, When, Then }) => {
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenQuestionnaireHasModes(Given, mocker);
      givenQuestionnaireHasCases(Given, questionnaireList, mocker);
      givenUacGenerationFails(Given, mocker);
      whenGoToDetailsPage(When);
      whenClickGenerateUacs(When);
      thenUacError(Then);
    },
  );

  Scenario(
    {
      name: "I can see how many Unique Access Codes have been generated for a questionnaire on the details page",
      args: { modes: "CAWI" },
    },
    ({ Given, When, Then }) => {
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenQuestionnaireHasModes(Given, mocker);
      givenQuestionnaireHasCases(Given, questionnaireList, mocker);
      givenQuestionnaireHasUacs(Given, mocker);
      whenGoToDetailsPage(When);
      thenCasesDisplayed(Then);
      thenGenerateUacAvailable(Then);
    },
  );
});
