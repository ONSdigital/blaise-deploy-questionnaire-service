import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterAll, afterEach, describe, vi } from "vitest";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import {
  givenTheQuestionnaireHasCases,
  givenTheQuestionnaireHasModes,
  givenTheQuestionnaireHasUacs,
  givenTheQuestionnaireIsInstalled,
  givenUacGenerationIsBroken,
} from "../step_definitions/given";
import {
  thenAGenerateUacButtonIsAvailable,
  thenAGenerateUacButtonIsNotAvailable,
  thenICanSeeThatThatTheQuestionnaireHasCases,
  thenIReceiveAUacError,
  thenUacsAreGenerated,
} from "../step_definitions/then";
import {
  whenIClickGenerateCases,
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
const mocker = new MockAdapter(axios, { onNoMatch: "throwException" });

describe("Feature: generate_uacs_for_cases", () => {
  const Scenario = createScenario();

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
    "Generate button exists for questionnaires with CAWI mode and cases",
    ({ Given, When, Then }) => {
      givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
      givenTheQuestionnaireHasModes(Given, mocker);
      givenTheQuestionnaireHasCases(Given, questionnaireList, mocker);

      whenIGoToTheQuestionnaireDetailsPage(When);

      thenAGenerateUacButtonIsAvailable(Then);
    },
  );

  Scenario(
    "Generate button does not exist for questionnaires in CAWI mode without cases",
    ({ Given, When, Then }) => {
      givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
      givenTheQuestionnaireHasModes(Given, mocker);
      givenTheQuestionnaireHasCases(Given, questionnaireList, mocker);

      whenIGoToTheQuestionnaireDetailsPage(When);

      thenAGenerateUacButtonIsNotAvailable(Then);
    },
  );

  Scenario(
    "Generate button does not exist for questionnaires in CATI mode without cases",
    ({ Given, When, Then }) => {
      givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
      givenTheQuestionnaireHasModes(Given, mocker);
      givenTheQuestionnaireHasCases(Given, questionnaireList, mocker);

      whenIGoToTheQuestionnaireDetailsPage(When);

      thenAGenerateUacButtonIsNotAvailable(Then);
    },
  );

  Scenario(
    "Generate button does not exist for questionnaires in CATI mode with cases",
    ({ Given, When, Then }) => {
      givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
      givenTheQuestionnaireHasModes(Given, mocker);
      givenTheQuestionnaireHasCases(Given, questionnaireList, mocker);

      whenIGoToTheQuestionnaireDetailsPage(When);

      thenAGenerateUacButtonIsNotAvailable(Then);
    },
  );

  Scenario(
    "I get a confirmation message When generating Unique Access Codes",
    ({ Given, When, Then }) => {
      givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
      givenTheQuestionnaireHasModes(Given, mocker);
      givenTheQuestionnaireHasCases(Given, questionnaireList, mocker);

      whenIGoToTheQuestionnaireDetailsPage(When);
      whenIClickGenerateCases(When);

      thenUacsAreGenerated(Then, mocker);
    },
  );

  Scenario("I get a error message When generating Unique Access Codes", ({ Given, When, Then }) => {
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireHasModes(Given, mocker);
    givenTheQuestionnaireHasCases(Given, questionnaireList, mocker);
    givenUacGenerationIsBroken(Given, mocker);

    whenIGoToTheQuestionnaireDetailsPage(When);
    whenIClickGenerateCases(When);

    thenIReceiveAUacError(Then);
  });

  Scenario(
    "I can see how many Unique Access Codes have been generated for a particular questionnaire in the details page",
    ({ Given, When, Then }) => {
      givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
      givenTheQuestionnaireHasModes(Given, mocker);
      givenTheQuestionnaireHasCases(Given, questionnaireList, mocker);
      givenTheQuestionnaireHasUacs(Given, mocker);

      whenIGoToTheQuestionnaireDetailsPage(When);
      thenICanSeeThatThatTheQuestionnaireHasCases(Then);
      thenAGenerateUacButtonIsAvailable(Then);
    },
  );
});
