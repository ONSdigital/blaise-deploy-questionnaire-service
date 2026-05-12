import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { defineFeature, loadFeature } from "jest-cucumber";

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

import type { Questionnaire } from "blaise-api-node-client";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const feature = loadFeature("./src/client/features/generate_uacs_for_cases.feature", {
  tagFilter: "not @server and not @integration",
});

const questionnaireList: Questionnaire[] = [];
const mocker = new MockAdapter(axios, { onNoMatch: "throwException" });

defineFeature(feature, (test) => {
  beforeEach(() => {
    globalThis.URL.createObjectURL = vi.fn();
  });

  afterEach(() => {
    mocker.reset();
  });

  test("Generate button exists for questionnaires with CAWI mode and cases", ({
    given,
    when,
    then,
  }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireHasModes(given, mocker);
    givenTheQuestionnaireHasCases(given, questionnaireList, mocker);

    whenIGoToTheQuestionnaireDetailsPage(when);

    thenAGenerateUacButtonIsAvailable(then);
  });

  test("Generate button does not exist for questionnaires in CAWI mode without cases", ({
    given,
    when,
    then,
  }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireHasModes(given, mocker);
    givenTheQuestionnaireHasCases(given, questionnaireList, mocker);

    whenIGoToTheQuestionnaireDetailsPage(when);

    thenAGenerateUacButtonIsNotAvailable(then);
  });

  test("Generate button does not exist for questionnaires in CATI mode without cases", ({
    given,
    when,
    then,
  }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireHasModes(given, mocker);
    givenTheQuestionnaireHasCases(given, questionnaireList, mocker);

    whenIGoToTheQuestionnaireDetailsPage(when);

    thenAGenerateUacButtonIsNotAvailable(then);
  });

  test("Generate button does not exist for questionnaires in CATI mode with cases", ({
    given,
    when,
    then,
  }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireHasModes(given, mocker);
    givenTheQuestionnaireHasCases(given, questionnaireList, mocker);

    whenIGoToTheQuestionnaireDetailsPage(when);

    thenAGenerateUacButtonIsNotAvailable(then);
  });

  test("I get a confirmation message when generating Unique Access Codes", ({
    given,
    when,
    then,
  }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireHasModes(given, mocker);
    givenTheQuestionnaireHasCases(given, questionnaireList, mocker);

    whenIGoToTheQuestionnaireDetailsPage(when);
    whenIClickGenerateCases(when);

    thenUacsAreGenerated(then, mocker);
  });

  test("I get a error message when generating Unique Access Codes", ({ given, when, then }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireHasModes(given, mocker);
    givenTheQuestionnaireHasCases(given, questionnaireList, mocker);
    givenUacGenerationIsBroken(given, mocker);

    whenIGoToTheQuestionnaireDetailsPage(when);
    whenIClickGenerateCases(when);

    thenIReceiveAUacError(then);
  });

  test("I can see how many Unique Access Codes have been generated for a particular questionnaire in the details page", ({
    given,
    when,
    then,
  }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireHasModes(given, mocker);
    givenTheQuestionnaireHasCases(given, questionnaireList, mocker);
    givenTheQuestionnaireHasUacs(given, mocker);

    whenIGoToTheQuestionnaireDetailsPage(when);
    thenICanSeeThatThatTheQuestionnaireHasCases(then);
    thenAGenerateUacButtonIsAvailable(then);
  });
});
