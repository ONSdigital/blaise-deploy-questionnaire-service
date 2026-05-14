import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterAll, afterEach, describe, vi } from "vitest";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import {
  givenTheQuestionnaireHasATotalmobileReleaseDate,
  givenTheQuestionnaireHasNoTotalmobileReleaseDate,
  givenTheQuestionnaireIsInstalled,
} from "../step_definitions/given";
import {
  thenICanViewTheTotalmobileReleaseDateIsSetTo,
  thenIHaveTheOptionToAddATotalmobileReleaseDate,
  thenIHaveTheOptionToChangeOrDeleteTheTotalmobileReleaseDate,
  thenTheTotalmobileReleaseDateIsDeleted,
  thenTheTotalmobileReleaseDateIsStored,
} from "../step_definitions/then";
import {
  whenIDeleteTheTotalmobileReleaseDate,
  whenIHaveSelectedToAddATotalmobileReleaseDate,
  whenILoadTheHomepage,
  whenISelectTheContinueButton,
  whenISelectTheQuestionnaire,
  whenISelectToChangeOrDeleteTotalmobileReleaseDate,
  whenISpecifyATotalmobileReleaseDateOf,
} from "../step_definitions/when";

import { createScenario } from "./native_scenario";

import type { Questionnaire } from "blaise-api-node-client";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const questionnaireList: Questionnaire[] = [];
const mocker = new MockAdapter(axios);

describe("Feature: edit_totalmobile_release_date", () => {
  const Scenario = createScenario();

  afterEach(() => {
    mocker.reset();
  });

  afterAll(() => {
    mocker.restore();
  });

  Scenario("View Totalmobile release date if specified", ({ Given, When, Then }) => {
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireHasATotalmobileReleaseDate(Given, mocker);

    whenILoadTheHomepage(When);
    whenISelectTheQuestionnaire(When);

    thenICanViewTheTotalmobileReleaseDateIsSetTo(Then);
  });

  Scenario("Change Totalmobile release date if specified", ({ Given, When, Then }) => {
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireHasATotalmobileReleaseDate(Given, mocker);

    whenILoadTheHomepage(When);
    whenISelectTheQuestionnaire(When);

    thenIHaveTheOptionToChangeOrDeleteTheTotalmobileReleaseDate(Then);
  });

  Scenario("Add Totalmobile release date if not previously specified", ({ Given, When, Then }) => {
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireHasNoTotalmobileReleaseDate(Given, mocker);

    whenILoadTheHomepage(When);
    whenISelectTheQuestionnaire(When);

    thenIHaveTheOptionToAddATotalmobileReleaseDate(Then);
  });

  Scenario(
    "Change an existing Totalmobile release date for a deployed questionnaire",
    ({ Given, When, Then }) => {
      givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
      givenTheQuestionnaireHasATotalmobileReleaseDate(Given, mocker);

      whenILoadTheHomepage(When);
      whenISelectTheQuestionnaire(When);
      whenISelectToChangeOrDeleteTotalmobileReleaseDate(When);
      whenISpecifyATotalmobileReleaseDateOf(When);
      whenISelectTheContinueButton(When);

      thenTheTotalmobileReleaseDateIsStored(Then, mocker);
    },
  );

  Scenario(
    "Delete a Totalmobile release date from a deployed questionnaire",
    ({ Given, When, Then }) => {
      givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
      givenTheQuestionnaireHasATotalmobileReleaseDate(Given, mocker);

      whenILoadTheHomepage(When);
      whenISelectTheQuestionnaire(When);
      whenISelectToChangeOrDeleteTotalmobileReleaseDate(When);
      whenIDeleteTheTotalmobileReleaseDate(When);
      whenISelectTheContinueButton(When);

      thenTheTotalmobileReleaseDateIsDeleted(Then, mocker);
    },
  );

  Scenario(
    "Add a Totalmobile release date to a deployed questionnaire",
    ({ Given, When, Then }) => {
      givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
      givenTheQuestionnaireHasNoTotalmobileReleaseDate(Given, mocker);

      whenILoadTheHomepage(When);
      whenISelectTheQuestionnaire(When);
      whenIHaveSelectedToAddATotalmobileReleaseDate(When);
      whenISpecifyATotalmobileReleaseDateOf(When);
      whenISelectTheContinueButton(When);

      thenTheTotalmobileReleaseDateIsStored(Then, mocker);
    },
  );
});
