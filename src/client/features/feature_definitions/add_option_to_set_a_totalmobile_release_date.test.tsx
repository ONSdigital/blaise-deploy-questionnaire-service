import "@testing-library/jest-dom";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { defineFeature, loadFeature } from "jest-cucumber";

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

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const feature = loadFeature(
  "./src/client/features/add_option_to_set_a_totalmobile_release_date.feature",
  {
    tagFilter: "not @server and not @integration",
  },
);

const mocker = new MockAdapter(axios);

defineFeature(feature, (test) => {
  afterEach(() => {
    mocker.reset();
  });

  test("Present Totalmobile release date selector", ({ given, when, then }) => {
    givenNoQuestionnairesAreInstalled(given, mocker);
    givenIHaveSelectedTheQuestionnairePackageToDeploy(given);
    whenIConfirmMySelection(when);
    whenISelectToInstallWithNoStartDate(when);
    thenIAmPresentedWithAnOptionToSpecifyATmReleaseDate(then);
  });

  test("Non LMS questionnaire does not see the release date selector", ({ given, when, then }) => {
    givenNoQuestionnairesAreInstalled(given, mocker);
    givenIHaveSelectedTheQuestionnairePackageToDeploy(given);
    whenIConfirmMySelection(when);
    whenISelectToInstallWithNoStartDate(when);
    thenIAmGivenASummaryOfTheDeployment(then);
  });

  test("Totalmobile date selected", ({ given, when, then }) => {
    givenNoQuestionnairesAreInstalled(given, mocker);
    givenIHaveSelectedTheQuestionnairePackageToDeploy(given);
    whenIConfirmMySelection(when);
    whenISelectToInstallWithNoStartDate(when);
    whenISpecifyATotalmobileReleaseDateOf(when);
    whenISelectTheContinueButton(when);
    thenICanViewTheTotalmobileReleaseDateIsSetTo(then);
  });

  test("If I select no date to be set", ({ given, when, then }) => {
    givenNoQuestionnairesAreInstalled(given, mocker);
    givenIHaveSelectedTheQuestionnairePackageToDeploy(given);
    whenIConfirmMySelection(when);
    whenISelectToInstallWithNoStartDate(when);
    whenISelectToInstallWithNoTmReleaseDate(when);
    thenTheSummaryPageHasNoTmReleaseDate(then);
  });
});
