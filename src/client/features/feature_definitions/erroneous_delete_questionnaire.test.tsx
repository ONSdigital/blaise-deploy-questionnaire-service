import "@testing-library/jest-dom";
import axios from "axios";
import Mockadapter from "axios-mock-adapter";
import { defineFeature, loadFeature } from "jest-cucumber";

import { MockAuthenticate } from "../../test-utils/authenticate.mock";
import {
  givenTheQuestionnaireCannotBeDeletedBecauseItWillGoErroneous,
  givenTheQuestionnaireIsErroneous,
  givenTheQuestionnaireIsInstalled,
} from "../step_definitions/given";
import {
  thenIAmPresentedWithACannotDeleteWarning,
  thenIAmPresentedWithAUnableDeleteWarning,
  thenIAmUnableToDeleteTheQuestionnaire,
  thenICanReturnToTheQuestionnaireList,
} from "../step_definitions/then";
import {
  whenIConfirmDelete,
  whenIDeleteAQuestionnaire,
  whenIGoToTheQuestionnaireDetailsPage,
} from "../step_definitions/when";

import type { Questionnaire } from "blaise-api-node-client";

vi.mock("blaise-login-react-client", async () => {
  const { mockLoginReactClientModule } = await import("../../test-utils/authenticate.mock");

  return mockLoginReactClientModule();
});

MockAuthenticate.OverrideReturnValues(null, true);

const feature = loadFeature("./src/client/features/erroneous_delete_questionnaire.feature", {
  tagFilter: "not @server and not @integration",
});

const questionnaireList: Questionnaire[] = [];
const mocker = new Mockadapter(axios);

defineFeature(feature, (test) => {
  afterEach(() => {
    mocker.reset();
  });

  test("Attempt to delete an questionnaire with an erroneous status", ({ given, when, then }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireIsErroneous(given, questionnaireList);
    whenIGoToTheQuestionnaireDetailsPage(when);
    whenIDeleteAQuestionnaire(when);
    thenIAmPresentedWithAUnableDeleteWarning(then);
    thenIAmUnableToDeleteTheQuestionnaire(then);
    thenICanReturnToTheQuestionnaireList(then);
  });

  test("Select to deploy a new questionnaire", ({ given, when, then }) => {
    givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
    givenTheQuestionnaireCannotBeDeletedBecauseItWillGoErroneous(when, mocker);
    whenIGoToTheQuestionnaireDetailsPage(when);
    whenIDeleteAQuestionnaire(when);
    whenIConfirmDelete(when);
    thenIAmPresentedWithACannotDeleteWarning(then);
  });
});
