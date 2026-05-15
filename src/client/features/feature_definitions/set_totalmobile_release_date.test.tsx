import "@testing-library/jest-dom/vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterAll, afterEach, describe, vi } from "vitest";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import {
  givenNoQuestionnairesInstalled,
  givenPackageSelectedForDeploy,
  givenQuestionnaireHasNoTmReleaseDate,
  givenQuestionnaireHasTmReleaseDate,
  givenQuestionnaireInstalled,
} from "../step_definitions/given";
import {
  thenAddTmReleaseDateOption,
  thenChangeOrDeleteTmReleaseDateOption,
  thenDeploymentSummary,
  thenSummaryHasNoTmReleaseDate,
  thenTmReleaseDateEntryShown,
  thenTmReleaseDatePrompt,
  thenTmReleaseDateShown,
} from "../step_definitions/then";
import {
  whenClickContinue,
  whenConfirmSelection,
  whenGoToDetailsPage,
  whenSkipToStartDate,
  whenSkipTmReleaseDate,
  whenSpecifyTmReleaseDate,
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

describe("Feature: totalmobile_release_date", () => {
  const Scenario = createScenario();

  afterEach(() => {
    mocker.reset();
  });

  afterAll(() => {
    mocker.restore();
  });

  Scenario("Present Totalmobile release date selector", ({ Given, When, Then }) => {
    givenNoQuestionnairesInstalled(Given, mocker);
    givenPackageSelectedForDeploy(Given);
    whenConfirmSelection(When);
    whenSkipToStartDate(When);
    thenTmReleaseDatePrompt(Then);
  });

  Scenario(
    "Non LMS questionnaire does not see the release date selector",
    ({ Given, When, Then }) => {
      givenNoQuestionnairesInstalled(Given, mocker);
      givenPackageSelectedForDeploy(Given);
      whenConfirmSelection(When);
      whenSkipToStartDate(When);
      thenDeploymentSummary(Then);
    },
  );

  Scenario("Totalmobile release date selected", ({ Given, When, Then }) => {
    givenNoQuestionnairesInstalled(Given, mocker);
    givenPackageSelectedForDeploy(Given);
    whenConfirmSelection(When);
    whenSkipToStartDate(When);
    whenSpecifyTmReleaseDate(When);
    whenClickContinue(When);
    thenTmReleaseDateShown(Then);
  });

  Scenario("No Totalmobile release date selected", ({ Given, When, Then }) => {
    givenNoQuestionnairesInstalled(Given, mocker);
    givenPackageSelectedForDeploy(Given);
    whenConfirmSelection(When);
    whenSkipToStartDate(When);
    whenSkipTmReleaseDate(When);
    thenSummaryHasNoTmReleaseDate(Then);
  });

  Scenario(
    "View Totalmobile release date in questionnaire details",
    ({ Given, When, Then }) => {
      givenQuestionnaireInstalled(Given, questionnaireList, mocker);
      givenQuestionnaireHasTmReleaseDate(Given, mocker);
      whenGoToDetailsPage(When);
      thenTmReleaseDateEntryShown(Then);
      thenChangeOrDeleteTmReleaseDateOption(Then);
    },
  );

  Scenario("Add Totalmobile release date in questionnaire details", ({ Given, When, Then }) => {
    givenQuestionnaireInstalled(Given, questionnaireList, mocker);
    givenQuestionnaireHasNoTmReleaseDate(Given, mocker);
    whenGoToDetailsPage(When);
    thenTmReleaseDateEntryShown(Then);
    thenAddTmReleaseDateOption(Then);
  });
});
