/**
 * @jest-environment jsdom
 */

import {defineFeature, loadFeature} from "jest-cucumber";
import {cleanup,} from "@testing-library/react";
import {Questionnaire} from "blaise-api-node-client";

import {AuthManager} from "blaise-login-react-client";
import axios from "axios";
import MockAdapeter from "axios-mock-adapter";
import {
    givenTheQuestionnaireIsInstalled,
    givenTheQuestionnaireHasATotalmobileReleaseDate,
    givenTheQuestionnaireHasNoTotalmobileReleaseDate
} from "../step_definitions/given";
import {
    whenILoadTheHomepage,
    whenISelectTheQuestionnaire
} from "../step_definitions/when";
import {
    thenICanViewTheTotalmobileReleaseDateIsSetTo
} from "../step_definitions/then";

jest.mock("blaise-login-react-client");
AuthManager.prototype.loggedIn = jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
});

const feature = loadFeature(
    "./src/features/edit_tm_release_date.feature",
    {tagFilter: "not @server and not @integration"}
);


const questionnaireList: Questionnaire[] = [];
const mocker = new MockAdapeter(axios);


defineFeature(feature, test => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        cleanup();
        mocker.reset();
    });

    test("View Totalmobile release date if specified", ({given, when, then}) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireHasATotalmobileReleaseDate(given, mocker);

        whenILoadTheHomepage(when);
        whenISelectTheQuestionnaire(when);

        // thenICanViewTheTotalmobileReleaseDateIsSetTo(then);
    });

    test("Change Totalmobile release date if specified", ({given, when, then}) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireHasATotalmobileReleaseDate(given, mocker);

        whenILoadTheHomepage(when);
        whenISelectTheQuestionnaire(when);

        // thenIHaveTheOptionToChangeOrDeleteTheTotalmobileReleaseDate(then);
    });

    test("Add Totalmobile release date if not previously specified", ({given, when, then}) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireHasNoTotalmobileReleaseDate(given, mocker);

        whenILoadTheHomepage(when);
        whenISelectTheQuestionnaire(when);

        // thenIHaveTheOptionToAddAToStartDate(then);
    });

    test("Change an existing Totalmobile release date for a deployed questionnaire", ({given, when, then}) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireHasATotalmobileReleaseDate(given, mocker);

        whenILoadTheHomepage(when);
        whenISelectTheQuestionnaire(when);
        // whenISelectToChangeOrDeleteTOStartDate(when);
        // whenISpecifyATOStartDateOf(when);
        // whenISelectTheContinueButton(when);
        //
        // thenTheToStartDateIsStored(then, mocker);
    });

    test("Delete a Totalmobile release date from a deployed questionnaire", ({given, when, then}) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireHasATotalmobileReleaseDate(given, mocker);

        whenILoadTheHomepage(when);
        whenISelectTheQuestionnaire(when);
        //     whenISelectToChangeOrDeleteTOStartDate(when);
        //     whenIDeleteTheToStartDate(when);
        //     whenISelectTheContinueButton(when);
        //
        //     thenTheToStartDateIsDeleted(then, mocker);
    });

    test("Add a Totalmobile release date to a deployed questionnaire", ({given, when, then}) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireHasNoTotalmobileReleaseDate(given, mocker);

        whenILoadTheHomepage(when);
        whenISelectTheQuestionnaire(when);
        // whenIHaveSelectedToAddAToStartDate(when);
        // whenISpecifyATOStartDateOf(when);
        // whenISelectTheContinueButton(when);
        //
        // thenTheToStartDateIsStored(then, mocker);
    });
});