/* eslint-disable import-x/order */
/**
 * @vitest-environment jsdom
 */

// Test modules
import { defineFeature, loadFeature } from "jest-cucumber";
import "@testing-library/jest-dom";
// Mock elements
import type { Questionnaire } from "blaise-api-node-client";

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

import axios from "axios";
import MockAdapeter from "axios-mock-adapter";

// mock login
vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } =
    await import("blaise-login-react/blaise-login-react-client");

  return mockLoginReactClientModule();
});
const { MockAuthenticate } = await import("blaise-login-react/blaise-login-react-client");

MockAuthenticate.OverrideReturnValues(null, true);

// Load in feature details from .feature file
const feature = loadFeature(
  "./src/features/display_totalmobile_release_date_on_questionnaire_details_page.feature",
  { tagFilter: "not @server and not @integration" },
);

const questionnaireList: Questionnaire[] = [];
const mocker = new MockAdapeter(axios);

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
