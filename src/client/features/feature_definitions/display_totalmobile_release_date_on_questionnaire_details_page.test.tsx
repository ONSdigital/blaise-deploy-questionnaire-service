import "@testing-library/jest-dom/vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterAll, afterEach, describe, vi } from "vitest";

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

import { createScenario } from "./nativeScenario";

import type { Questionnaire } from "blaise-api-node-client";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const questionnaireList: Questionnaire[] = [];
const mocker = new MockAdapter(axios);

describe("Feature: display_totalmobile_release_date_on_questionnaire_details_page", () => {
  const Scenario = createScenario();

  afterEach(() => {
    mocker.reset();
  });

  afterAll(() => {
    mocker.restore();
  });

  Scenario(
    "View saved Totalmobile release date in questionnaire details",
    ({ Given, When, Then }) => {
      givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
      givenTheQuestionnaireHasATotalmobileReleaseDate(Given, mocker);
      whenIGoToTheQuestionnaireDetailsPage(When);
      thenIWillSeeAnEntryDisplayedForTotalmobileReleaseDate(Then);
      thenIHaveTheOptionToChangeOrDeleteTheTotalmobileReleaseDate(Then);
    },
  );

  Scenario("Add Totalmobile release date in questionnaire details", ({ Given, When, Then }) => {
    givenTheQuestionnaireIsInstalled(Given, questionnaireList, mocker);
    givenTheQuestionnaireDoesNotHaveATotalmobileReleaseDate(Given, mocker);
    whenIGoToTheQuestionnaireDetailsPage(When);
    thenIWillSeeAnEntryDisplayedForTotalmobileReleaseDate(Then);
    thenIHaveTheOptionToAddATotalmobileReleaseDate(Then);
  });
});
