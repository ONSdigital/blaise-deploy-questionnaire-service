import "@testing-library/jest-dom/vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterAll, afterEach, describe, vi } from "vitest";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import {
  givenIHaveSelectedTheQuestionnairePackageToDeploy,
  givenNoQuestionnairesAreInstalled,
} from "../step_definitions/given";
import {
  thenIAmGivenASummaryOfTheDeployment,
  thenIAmPresentedWithAnOptionToSpecifyATmReleaseDate,
  thenICanViewTheTotalmobileReleaseDateIsSetTo,
  thenTheSummaryPageHasNoTmReleaseDate,
} from "../step_definitions/then";
import {
  whenIConfirmMySelection,
  whenISelectTheContinueButton,
  whenISelectToInstallWithNoStartDate,
  whenISelectToInstallWithNoTmReleaseDate,
  whenISpecifyATotalmobileReleaseDateOf,
} from "../step_definitions/when";

import { createScenario } from "./nativeScenario";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const mocker = new MockAdapter(axios);

describe("Feature: add_option_to_set_a_totalmobile_release_date", () => {
  const Scenario = createScenario();

  afterEach(() => {
    mocker.reset();
  });

  afterAll(() => {
    mocker.restore();
  });

  Scenario("Present Totalmobile release date selector", ({ Given, When, Then }) => {
    givenNoQuestionnairesAreInstalled(Given, mocker);
    givenIHaveSelectedTheQuestionnairePackageToDeploy(Given);
    whenIConfirmMySelection(When);
    whenISelectToInstallWithNoStartDate(When);
    thenIAmPresentedWithAnOptionToSpecifyATmReleaseDate(Then);
  });

  Scenario(
    "Non LMS questionnaire does not see the release date selector",
    ({ Given, When, Then }) => {
      givenNoQuestionnairesAreInstalled(Given, mocker);
      givenIHaveSelectedTheQuestionnairePackageToDeploy(Given);
      whenIConfirmMySelection(When);
      whenISelectToInstallWithNoStartDate(When);
      thenIAmGivenASummaryOfTheDeployment(Then);
    },
  );

  Scenario("Totalmobile date selected", ({ Given, When, Then }) => {
    givenNoQuestionnairesAreInstalled(Given, mocker);
    givenIHaveSelectedTheQuestionnairePackageToDeploy(Given);
    whenIConfirmMySelection(When);
    whenISelectToInstallWithNoStartDate(When);
    whenISpecifyATotalmobileReleaseDateOf(When);
    whenISelectTheContinueButton(When);
    thenICanViewTheTotalmobileReleaseDateIsSetTo(Then);
  });

  Scenario("If I select no date to be set", ({ Given, When, Then }) => {
    givenNoQuestionnairesAreInstalled(Given, mocker);
    givenIHaveSelectedTheQuestionnairePackageToDeploy(Given);
    whenIConfirmMySelection(When);
    whenISelectToInstallWithNoStartDate(When);
    whenISelectToInstallWithNoTmReleaseDate(When);
    thenTheSummaryPageHasNoTmReleaseDate(Then);
  });
});
