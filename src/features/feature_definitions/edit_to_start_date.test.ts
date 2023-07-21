/**
 * @jest-environment jsdom
 */

import { defineFeature, loadFeature } from "jest-cucumber";
import { IQuestionnaire } from "blaise-api-node-client";

import { thenICanViewTheTOStartDateIsSetTo, thenIHaveTheOptionToAddAToStartDate, thenIHaveTheOptionToChangeOrDeleteTheToStartDate, thenTheToStartDateIsDeleted, thenTheToStartDateIsStored } from "../step_definitions/then";
import { whenIDeleteTheToStartDate, whenIHaveSelectedToAddAToStartDate, whenILoadTheHomepage, whenISelectTheContinueButton, whenISelectTheQuestionnaire, whenISelectToChangeOrDeleteTOStartDate, whenISpecifyATOStartDateOf } from "../step_definitions/when";
import { givenTheQuestionnaireHasATOStartDate, givenTheQuestionnaireHasNoTOStartDate, givenTheQuestionnaireIsInstalled } from "../step_definitions/given";
import { AuthManager } from "blaise-login-react-client";
import axios from "axios";
import MockAdapeter from "axios-mock-adapter";

jest.mock("blaise-login-react-client");
AuthManager.prototype.loggedIn = jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
});

const feature = loadFeature(
    "./src/features/edit_to_start_date.feature",
    { tagFilter: "not @server and not @integration" }
);

const questionnaireList: IQuestionnaire[] = [];
const mocker = new MockAdapeter(axios);

defineFeature(feature, test => {
    afterEach(() => {
        mocker.reset();
    });

    test("View TO Start Date if specified", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireHasATOStartDate(given, mocker);

        whenILoadTheHomepage(when);
        whenISelectTheQuestionnaire(when);

        thenICanViewTheTOStartDateIsSetTo(then);
    });

    test("Change TO Start Date if specified", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireHasATOStartDate(given, mocker);

        whenILoadTheHomepage(when);
        whenISelectTheQuestionnaire(when);

        thenIHaveTheOptionToChangeOrDeleteTheToStartDate(then);
    });

    test("Add TO Start Date if not previously specified", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireHasNoTOStartDate(given, mocker);

        whenILoadTheHomepage(when);
        whenISelectTheQuestionnaire(when);

        thenIHaveTheOptionToAddAToStartDate(then);
    });

    test("Change an existing TO Start Date for a deployed questionnaire", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireHasATOStartDate(given, mocker);

        whenILoadTheHomepage(when);
        whenISelectTheQuestionnaire(when);
        whenISelectToChangeOrDeleteTOStartDate(when);
        whenISpecifyATOStartDateOf(when);
        whenISelectTheContinueButton(when);

        thenTheToStartDateIsStored(then, mocker);
    });

    test("Delete a TO start date from a deployed questionnaire", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireHasATOStartDate(given, mocker);

        whenILoadTheHomepage(when);
        whenISelectTheQuestionnaire(when);
        whenISelectToChangeOrDeleteTOStartDate(when);
        whenIDeleteTheToStartDate(when);
        whenISelectTheContinueButton(when);

        thenTheToStartDateIsDeleted(then, mocker);
    });

    test("Add a TO Start Date to a deployed questionnaire", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireHasNoTOStartDate(given, mocker);

        whenILoadTheHomepage(when);
        whenISelectTheQuestionnaire(when);
        whenIHaveSelectedToAddAToStartDate(when);
        whenISpecifyATOStartDateOf(when);
        whenISelectTheContinueButton(when);

        thenTheToStartDateIsStored(then, mocker);
    });
});
