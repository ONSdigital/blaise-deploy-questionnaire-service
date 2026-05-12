import "@testing-library/jest-dom";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { defineFeature, loadFeature } from "jest-cucumber";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import {
  givenTheQuestionnaireHasActiveSurveyDays,
  givenTheQuestionnaireHasModes,
  givenTheQuestionnaireIsActive,
  givenTheQuestionnaireIsInactive,
  givenTheQuestionnaireIsInstalled,
} from "../step_definitions/given";
import {
  thenIAmPresentedWithAnActiveSurveyDaysWarning,
  thenIAmPresentedWithAnActiveWebCollectionWarning,
  thenIAmPresentedWithAWarning,
  thenIAmReturnedToTheQuestionnaireDetailsPage,
  thenIGetTheDeleteSuccessBanner,
  thenIWillNotHaveTheOptionToDelete,
  thenTheQuestionnaireDataIsDeleted,
  thenTheQuestionnaireDataIsNotDeleted,
} from "../step_definitions/then";
import {
  whenICancelDelete,
  whenIConfirmDelete,
  whenIDeleteAQuestionnaire,
  whenIGoToTheQuestionnaireDetailsPage,
  whenILoadTheHomepage,
} from "../step_definitions/when";

import type { Questionnaire } from "blaise-api-node-client";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const feature = loadFeature("./src/client/features/delete_a_questionnaire.feature", {
  tagFilter: "not @server and not @integration",
});

const questionnaireList: Questionnaire[] = [];
const mocker = new MockAdapter(axios);

defineFeature(feature, (test) => {
  beforeEach(() => {
    questionnaireList.length = 0;
  });

  afterEach(() => {
    mocker.reset();
  });

  test("Delete an 'inactive' survey at any time", ({ given, when, then }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireIsInactive(given, questionnaireList, mocker);
    givenTheQuestionnaireHasActiveSurveyDays(given, questionnaireList, mocker);
    whenIGoToTheQuestionnaireDetailsPage(when);
    whenIDeleteAQuestionnaire(when);
    whenIConfirmDelete(when);
    thenTheQuestionnaireDataIsDeleted(then, mocker);
    thenIGetTheDeleteSuccessBanner(then);
  });

  test("Delete a questionnaire not available from the homepage", ({ given, when, then }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    whenILoadTheHomepage(when);
    thenIWillNotHaveTheOptionToDelete(then);
  });

  test("Confirm deletion", ({ given, when, then }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    whenIGoToTheQuestionnaireDetailsPage(when);
    whenIDeleteAQuestionnaire(when);
    whenIConfirmDelete(when);
    thenTheQuestionnaireDataIsDeleted(then, mocker);
    thenIGetTheDeleteSuccessBanner(then);
  });

  test("Cancel deletion", ({ given, when, then }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    whenIGoToTheQuestionnaireDetailsPage(when);
    whenIDeleteAQuestionnaire(when);
    whenICancelDelete(when);
    thenTheQuestionnaireDataIsNotDeleted(then, mocker);
    thenIAmReturnedToTheQuestionnaireDetailsPage(then);
  });

  test("Select to delete questionnaire that is active and live", ({ given, when, then }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireIsActive(given, questionnaireList, mocker);
    givenTheQuestionnaireHasActiveSurveyDays(given, questionnaireList, mocker);
    whenIGoToTheQuestionnaireDetailsPage(when);
    whenIDeleteAQuestionnaire(when);
    thenIAmPresentedWithAnActiveSurveyDaysWarning(then);
    whenIConfirmDelete(when);
    thenTheQuestionnaireDataIsDeleted(then, mocker);
    thenIGetTheDeleteSuccessBanner(then);
  });

  test("Select to delete questionnaire that is active and not live", ({ given, when, then }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireHasActiveSurveyDays(given, questionnaireList, mocker);
    whenIGoToTheQuestionnaireDetailsPage(when);
    whenIDeleteAQuestionnaire(when);
    thenIAmPresentedWithAWarning(then);
    whenIConfirmDelete(when);
    thenTheQuestionnaireDataIsDeleted(then, mocker);
    thenIGetTheDeleteSuccessBanner(then);
  });

  test("Select to delete questionnaire that is inactive", ({ given, when, then }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireIsInactive(given, questionnaireList, mocker);
    whenIGoToTheQuestionnaireDetailsPage(when);
    whenIDeleteAQuestionnaire(when);
    whenIConfirmDelete(when);
    thenTheQuestionnaireDataIsDeleted(then, mocker);
    thenIGetTheDeleteSuccessBanner(then);
  });

  test("Select to delete questionnaire that is active and has mode set to CAWI", ({
    given,
    when,
    then,
  }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireIsActive(given, questionnaireList, mocker);
    givenTheQuestionnaireHasModes(given, mocker);
    whenIGoToTheQuestionnaireDetailsPage(when);
    whenIDeleteAQuestionnaire(when);
    thenIAmPresentedWithAnActiveWebCollectionWarning(then);
    whenIConfirmDelete(when);
    thenTheQuestionnaireDataIsDeleted(then, mocker);
    thenIGetTheDeleteSuccessBanner(then);
  });
});
