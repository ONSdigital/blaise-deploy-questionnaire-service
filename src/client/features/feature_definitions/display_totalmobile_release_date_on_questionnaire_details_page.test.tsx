import "@testing-library/jest-dom";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { defineFeature, loadFeature } from "jest-cucumber";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import {
  givenTheQuestionnaireDoesNotHaveATotalmobileReleaseDate,
  givenTheQuestionnaireHasATotalmobileReleaseDate,
  givenTheQuestionnaireIsInstalled,
} from "../step_definitions/given";
import {
  thenIHaveTheOptionToAddATotalmobileReleaseDate,
  thenIHaveTheOptionToChangeOrDeleteTheTotalmobileReleaseDate,
  thenIWillSeeAnEntryDisplayedForTotalmobileReleaseDate,
} from "../step_definitions/then";
import { whenIGoToTheQuestionnaireDetailsPage } from "../step_definitions/when";

import type { Questionnaire } from "blaise-api-node-client";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const feature = loadFeature(
  "./src/client/features/display_totalmobile_release_date_on_questionnaire_details_page.feature",
  { tagFilter: "not @server and not @integration" },
);

const questionnaireList: Questionnaire[] = [];
const mocker = new MockAdapter(axios);

defineFeature(feature, (test) => {
  afterEach(() => {
    mocker.reset();
  });

  test("View saved Totalmobile release date in questionnaire details", ({ given, when, then }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireHasATotalmobileReleaseDate(given, mocker);
    whenIGoToTheQuestionnaireDetailsPage(when);
    thenIWillSeeAnEntryDisplayedForTotalmobileReleaseDate(then);
    thenIHaveTheOptionToChangeOrDeleteTheTotalmobileReleaseDate(then);
  });

  test("Add Totalmobile release date in questionnaire details", ({ given, when, then }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireDoesNotHaveATotalmobileReleaseDate(given, mocker);
    whenIGoToTheQuestionnaireDetailsPage(when);
    thenIWillSeeAnEntryDisplayedForTotalmobileReleaseDate(then);
    thenIHaveTheOptionToAddATotalmobileReleaseDate(then);
  });
});
