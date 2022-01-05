import { defineFeature, loadFeature } from "jest-cucumber";
import { mock_builder, mock_fetch_requests } from "../step_definitions/helpers/functions";
import { cleanup, } from "@testing-library/react";
import { Instrument } from "../../../Interfaces";

import { thenICanViewTheTOStartDateSetToo, thenIHaveTheOptionToAddAToStartDate, thenIHaveTheOptionToChangeOrDeleteTheToStartDate, thenTheToStartDateIsDeleted, thenTheToStartDateIsStored } from "../step_definitions/then";
import { whenIDeleteTheToStartDate, whenIHaveSelectedToAddAToStartDate, whenILoadTheHomepage, whenISelectTheContinueButton, whenISelectTheQuestionnaire, whenISelectToChangeOrDeleteTOStartDate, whenISpecifyAToStartDateOf } from "../step_definitions/when";
import { givenTheQuestionnaireHasATOStartDate, givenTheQuestionnaireHasNoTOStartDate, givenTheQuestionnaireIsInstalled } from "../step_definitions/given";

const feature = loadFeature(
    "./src/features/edit_to_start_date.feature",
    { tagFilter: "not @server and not @integration" }
);


const instrumentList: Instrument[] = [];
const mockList: Record<string, Promise<any>> = {};


defineFeature(feature, test => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        jest.resetModules();
    });

    beforeEach(() => {
        cleanup();
    });

    test("View TO Start Date if specified", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mockList);
        givenTheQuestionnaireHasATOStartDate(given, mockList);

        mock_fetch_requests(mock_builder(mockList));

        whenILoadTheHomepage(when);
        whenISelectTheQuestionnaire(when);

        thenICanViewTheTOStartDateSetToo(then);
    });

    test("Change TO Start Date if specified", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mockList);
        givenTheQuestionnaireHasATOStartDate(given, mockList);

        mock_fetch_requests(mock_builder(mockList));

        whenILoadTheHomepage(when);
        whenISelectTheQuestionnaire(when);

        thenIHaveTheOptionToChangeOrDeleteTheToStartDate(then);
    });

    test("Add TO Start Date if not previously specified", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mockList);
        givenTheQuestionnaireHasNoTOStartDate(given, mockList);

        mock_fetch_requests(mock_builder(mockList));

        whenILoadTheHomepage(when);
        whenISelectTheQuestionnaire(when);

        thenIHaveTheOptionToAddAToStartDate(then);
    });

    test("Change an existing TO Start Date for a deployed questionnaire", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mockList);
        givenTheQuestionnaireHasATOStartDate(given, mockList);

        mock_fetch_requests(mock_builder(mockList));

        whenILoadTheHomepage(when);
        whenISelectTheQuestionnaire(when);
        whenISelectToChangeOrDeleteTOStartDate(when);
        whenISpecifyAToStartDateOf(when);
        whenISelectTheContinueButton(when);

        thenTheToStartDateIsStored(then);
    });

    test("Delete a TO start date from a deployed questionnaire", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mockList);
        givenTheQuestionnaireHasATOStartDate(given, mockList);

        mock_fetch_requests(mock_builder(mockList));

        whenILoadTheHomepage(when);
        whenISelectTheQuestionnaire(when);
        whenISelectToChangeOrDeleteTOStartDate(when);
        whenIDeleteTheToStartDate(when);
        whenISelectTheContinueButton(when);

        thenTheToStartDateIsDeleted(then);
    });

    test("Add a TO Start Date to a deployed questionnaire", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mockList);
        givenTheQuestionnaireHasNoTOStartDate(given, mockList);

        mock_fetch_requests(mock_builder(mockList));

        whenILoadTheHomepage(when);
        whenISelectTheQuestionnaire(when);
        whenIHaveSelectedToAddAToStartDate(when);
        whenISpecifyAToStartDateOf(when);
        whenISelectTheContinueButton(when);

        thenTheToStartDateIsStored(then);
    });
});
