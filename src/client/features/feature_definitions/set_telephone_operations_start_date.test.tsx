import "@testing-library/jest-dom/vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterEach, describe, vi } from "vitest";

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

import { createScenario } from "./nativeScenario";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const mocker = new MockAdapter(axios);

describe("Feature: set_telephone_operations_start_date", () => {
  const Scenario = createScenario();

  afterEach(() => {
    mocker.reset();
  });

  Scenario("Present TO Start Date option", ({ Given, When, Then }) => {
    givenNoQuestionnairesAreInstalled(Given, mocker);
    givenIHaveSelectedTheQuestionnairePackageToDeploy(Given);

    whenIConfirmMySelection(When);

    thenIAmPresentedWithAnOptionToSpecifyAToStartDate(Then);
  });

  Scenario("Enter TO Start Date", ({ Given, When, Then }) => {
    givenNoQuestionnairesAreInstalled(Given, mocker);
    givenIHaveSelectedTheQuestionnairePackageToDeploy(Given);

    whenIConfirmMySelection(When);
    whenISpecifyATOStartDateOf(When);
    whenISelectTheContinueButton(When);

    thenICanViewTheTOStartDateIsSetTo(Then);
  });

  Scenario("Do not enter TO Start Date", ({ Given, When, Then }) => {
    givenNoQuestionnairesAreInstalled(Given, mocker);
    givenIHaveSelectedTheQuestionnairePackageToDeploy(Given);

    whenIConfirmMySelection(When);
    whenISelectToInstallWithNoStartDate(When);

    thenTheSummaryPageHasNoToStartDate(Then);
  });

  Scenario("Setting the TO Start Date fails during deployment", ({ Given, When, Then }) => {
    givenNoQuestionnairesAreInstalled(Given, mocker);
    givenTOStartDateFails(Given, mocker);
    givenIHaveSelectedTheQuestionnairePackageToDeploy(Given);

    whenIConfirmMySelection(When);
    whenISpecifyATOStartDateOf(When);
    whenISelectTheContinueButton(When);
    whenIDeployTheQuestionnaire(When);

    thenIGetAnErrorBannerWithMessage(Then);
  });
});
