import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { defineFeature, loadFeature } from "jest-cucumber";

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

import type { Questionnaire } from "blaise-api-node-client";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const feature = loadFeature("./src/client/features/edit_tm_release_date.feature", {
  tagFilter: "not @server and not @integration",
});

const questionnaireList: Questionnaire[] = [];
const mocker = new MockAdapter(axios);

defineFeature(feature, (test) => {
  afterEach(() => {
    mocker.reset();
  });

  test("View Totalmobile release date if specified", ({ given, when, then }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireHasATotalmobileReleaseDate(given, mocker);

    whenILoadTheHomepage(when);
    whenISelectTheQuestionnaire(when);

    thenICanViewTheTotalmobileReleaseDateIsSetTo(then);
  });

  test("Change Totalmobile release date if specified", ({ given, when, then }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireHasATotalmobileReleaseDate(given, mocker);

    whenILoadTheHomepage(when);
    whenISelectTheQuestionnaire(when);

    thenIHaveTheOptionToChangeOrDeleteTheTotalmobileReleaseDate(then);
  });

  test("Add Totalmobile release date if not previously specified", ({ given, when, then }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireHasNoTotalmobileReleaseDate(given, mocker);

    whenILoadTheHomepage(when);
    whenISelectTheQuestionnaire(when);

    thenIHaveTheOptionToAddATotalmobileReleaseDate(then);
  });

  test("Change an existing Totalmobile release date for a deployed questionnaire", ({
    given,
    when,
    then,
  }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireHasATotalmobileReleaseDate(given, mocker);

    whenILoadTheHomepage(when);
    whenISelectTheQuestionnaire(when);
    whenISelectToChangeOrDeleteTotalmobileReleaseDate(when);
    whenISpecifyATotalmobileReleaseDateOf(when);
    whenISelectTheContinueButton(when);

    thenTheTotalmobileReleaseDateIsStored(then, mocker);
  });

  test("Delete a Totalmobile release date from a deployed questionnaire", ({
    given,
    when,
    then,
  }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireHasATotalmobileReleaseDate(given, mocker);

    whenILoadTheHomepage(when);
    whenISelectTheQuestionnaire(when);
    whenISelectToChangeOrDeleteTotalmobileReleaseDate(when);
    whenIDeleteTheTotalmobileReleaseDate(when);
    whenISelectTheContinueButton(when);

    thenTheTotalmobileReleaseDateIsDeleted(then, mocker);
  });

  test("Add a Totalmobile release date to a deployed questionnaire", ({ given, when, then }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireHasNoTotalmobileReleaseDate(given, mocker);

    whenILoadTheHomepage(when);
    whenISelectTheQuestionnaire(when);
    whenIHaveSelectedToAddATotalmobileReleaseDate(when);
    whenISpecifyATotalmobileReleaseDateOf(when);
    whenISelectTheContinueButton(when);

    thenTheTotalmobileReleaseDateIsStored(then, mocker);
  });
});
