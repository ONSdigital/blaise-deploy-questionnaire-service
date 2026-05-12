import "@testing-library/jest-dom";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { defineFeature, loadFeature } from "jest-cucumber";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import {
  givenIHaveSelectedTheQuestionnairePackageToDeploy,
  givenNoQuestionnairesAreInstalled,
  givenTOStartDateFails,
} from "../step_definitions/given";
import {
  thenIAmPresentedWithAnOptionToSpecifyAToStartDate,
  thenICanViewTheTOStartDateIsSetTo,
  thenIGetAnErrorBannerWithMessage,
  thenTheSummaryPageHasNoToStartDate,
} from "../step_definitions/then";
import {
  whenIConfirmMySelection,
  whenIDeployTheQuestionnaire,
  whenISelectTheContinueButton,
  whenISelectToInstallWithNoStartDate,
  whenISpecifyATOStartDateOf,
} from "../step_definitions/when";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const feature = loadFeature("./src/client/features/set_telephone_operations_start_date.feature", {
  tagFilter: "not @server and not @integration",
});

const mocker = new MockAdapter(axios);

defineFeature(feature, (test) => {
  afterEach(() => {
    mocker.reset();
  });

  test("Present TO Start Date option", ({ given, when, then }) => {
    givenNoQuestionnairesAreInstalled(given, mocker);
    givenIHaveSelectedTheQuestionnairePackageToDeploy(given);

    whenIConfirmMySelection(when);

    thenIAmPresentedWithAnOptionToSpecifyAToStartDate(then);
  });

  test("Enter TO Start Date", ({ given, when, then }) => {
    givenNoQuestionnairesAreInstalled(given, mocker);
    givenIHaveSelectedTheQuestionnairePackageToDeploy(given);

    whenIConfirmMySelection(when);
    whenISpecifyATOStartDateOf(when);
    whenISelectTheContinueButton(when);

    thenICanViewTheTOStartDateIsSetTo(then);
  });

  test("Do not enter TO Start Date", ({ given, when, then }) => {
    givenNoQuestionnairesAreInstalled(given, mocker);
    givenIHaveSelectedTheQuestionnairePackageToDeploy(given);

    whenIConfirmMySelection(when);
    whenISelectToInstallWithNoStartDate(when);

    thenTheSummaryPageHasNoToStartDate(then);
  });

  test("Setting the TO Start Date fails during deployment", ({ given, when, then }) => {
    givenNoQuestionnairesAreInstalled(given, mocker);
    givenTOStartDateFails(given, mocker);
    givenIHaveSelectedTheQuestionnairePackageToDeploy(given);

    whenIConfirmMySelection(when);
    whenISpecifyATOStartDateOf(when);
    whenISelectTheContinueButton(when);
    whenIDeployTheQuestionnaire(when);

    thenIGetAnErrorBannerWithMessage(then);
  });
});
