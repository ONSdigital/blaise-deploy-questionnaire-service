// Test modules
import { defineFeature, loadFeature } from "jest-cucumber";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
// Mock elements
import { mock_builder, mock_fetch_requests } from "../step_definitions/helpers/functions";

import { givenIHaveSelectedTheQuestionnairePacakgeToDeploy, givenNoQuestionnairesAreInstalled, givenTOStartDateFails } from "../step_definitions/given";
import { thenIAmPresentedWithAnOptionToSpecifyATOStartDate, thenICanViewTheTOStartDateSetToo, thenIGetAnErrorBannerWithMessage, thenTheSummaryPageHasNoTOStartDate } from "../step_definitions/then";
import { whenIConfirmMySelection, whenIDeployTheQuestionnaire, whenISelectTheContinueButton, whenISelectToInstallWithNoStartDate, whenISpecifyAToStartDateOf } from "../step_definitions/when";


// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/set_telephone_operations_start_date.feature",
    { tagFilter: "not @server and not @integration" }
);


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

    test("Present TO Start Date option", ({ given, when, then }) => {
        givenNoQuestionnairesAreInstalled(given, mockList);
        givenIHaveSelectedTheQuestionnairePacakgeToDeploy(given);

        mock_fetch_requests(mock_builder(mockList));

        whenIConfirmMySelection(when);

        thenIAmPresentedWithAnOptionToSpecifyATOStartDate(then);
    });


    test("Enter TO Start Date", ({ given, when, then }) => {
        givenNoQuestionnairesAreInstalled(given, mockList);
        givenIHaveSelectedTheQuestionnairePacakgeToDeploy(given);

        mock_fetch_requests(mock_builder(mockList));

        whenIConfirmMySelection(when);
        whenISpecifyAToStartDateOf(when);
        whenISelectTheContinueButton(when);

        thenICanViewTheTOStartDateSetToo(then);
    });


    test("Do not enter TO Start Date", ({ given, when, then }) => {
        givenNoQuestionnairesAreInstalled(given, mockList);
        givenIHaveSelectedTheQuestionnairePacakgeToDeploy(given);

        mock_fetch_requests(mock_builder(mockList));

        whenIConfirmMySelection(when);
        whenISelectToInstallWithNoStartDate(when);

        thenTheSummaryPageHasNoTOStartDate(then);
    });


    test("Setting the TO Start Date fails during deployment", ({ given, when, then }) => {
        givenNoQuestionnairesAreInstalled(given, mockList);
        givenTOStartDateFails(given, mockList);
        givenIHaveSelectedTheQuestionnairePacakgeToDeploy(given);

        mock_fetch_requests(mock_builder(mockList));

        whenIConfirmMySelection(when);
        whenISpecifyAToStartDateOf(when);
        whenISelectTheContinueButton(when);
        whenIDeployTheQuestionnaire(when);

        thenIGetAnErrorBannerWithMessage(then);
    });
});
