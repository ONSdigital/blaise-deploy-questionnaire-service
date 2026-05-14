import "@testing-library/jest-dom/vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { afterAll, afterEach, describe, vi } from "vitest";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import {
  givenIHaveSelectedTheQuestionnairePackageToDeploy,
  givenNoQuestionnairesAreInstalled,
  givenToStartDateFails,
} from "../step_definitions/given";
import {
  thenIAmPresentedWithAnOptionToSpecifyAToStartDate,
  thenICanViewTheToStartDateIsSetTo,
  thenIGetAnErrorBannerWithMessage,
  thenTheSummaryPageHasNoToStartDate,
} from "../step_definitions/then";
import {
  whenIConfirmMySelection,
  whenIDeployTheQuestionnaire,
  whenISelectTheContinueButton,
  whenISelectToInstallWithNoStartDate,
  whenISpecifyAToStartDateOf,
} from "../step_definitions/when";

import { createScenario } from "./native_scenario";

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

  afterAll(() => {
    mocker.restore();
  });

  Scenario("Present Telephone Operations start date option", ({ Given, When, Then }) => {
    givenNoQuestionnairesAreInstalled(Given, mocker);
    givenIHaveSelectedTheQuestionnairePackageToDeploy(Given);

    whenIConfirmMySelection(When);

    thenIAmPresentedWithAnOptionToSpecifyAToStartDate(Then);
  });

  Scenario("Enter Telephone Operations start date", ({ Given, When, Then }) => {
    givenNoQuestionnairesAreInstalled(Given, mocker);
    givenIHaveSelectedTheQuestionnairePackageToDeploy(Given);

    whenIConfirmMySelection(When);
    whenISpecifyAToStartDateOf(When);
    whenISelectTheContinueButton(When);

    thenICanViewTheToStartDateIsSetTo(Then);
  });

  Scenario("Do not enter Telephone Operations start date", ({ Given, When, Then }) => {
    givenNoQuestionnairesAreInstalled(Given, mocker);
    givenIHaveSelectedTheQuestionnairePackageToDeploy(Given);

    whenIConfirmMySelection(When);
    whenISelectToInstallWithNoStartDate(When);

    thenTheSummaryPageHasNoToStartDate(Then);
  });

  Scenario("Setting the Telephone Operations start date fails during deployment", ({ Given, When, Then }) => {
    givenNoQuestionnairesAreInstalled(Given, mocker);
    givenToStartDateFails(Given, mocker);
    givenIHaveSelectedTheQuestionnairePackageToDeploy(Given);

    whenIConfirmMySelection(When);
    whenISpecifyAToStartDateOf(When);
    whenISelectTheContinueButton(When);
    whenIDeployTheQuestionnaire(When);

    thenIGetAnErrorBannerWithMessage(Then);
  });
});
