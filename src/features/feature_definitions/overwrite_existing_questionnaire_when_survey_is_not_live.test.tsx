// Test modules
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { defineFeature, loadFeature } from "jest-cucumber";
import { Instrument } from "../../../Interfaces";
// Mock elements
import {
    mock_builder,
    mock_fetch_requests
} from "../step_definitions/helpers/functions";

import { givenIHaveSelectedTheQuestionnairePacakgeToDeploy, givenTheQuestionnaireIsInstalled, givenTheQuestionnaireIsLive } from "../step_definitions/given";
import { thenIAmPresentedWithAConfirmOverwriteWarning, thenIAmPresentedWithASuccessfullyDeployedBanner, thenIAmPresentedWithTheOptionsToCancelOrOverwrite, thenIAmReturnedToTheLandingPage, thenICanOnlyReturnToTheLandingPage, thenICanRetryAnInstall, thenIGetTheQuestionnaireIsLiveWarningBanner, thenTheQuestionnaireIsInstalled } from "../step_definitions/then";
import { whenIConfirmMySelection, whenIConfirmNotToOverwrite, whenIConfirmToOverwrite, whenISelectToOverwrite } from "../step_definitions/when";


const mock = new MockAdapter(axios, { onNoMatch: "throwException" });


// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/overwrite_existing_questionnaire_when_survey_is_not_live.feature",
    { tagFilter: "not @server and not @integration" }
);


const instrumentList: Instrument[] = [];
const mockList: Record<string, Promise<any>> = {};

defineFeature(feature, test => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        jest.resetModules();
        mock.reset();
    });

    beforeEach(() => {
        cleanup();
        mock.onPut(/^https:\/\/storage\.googleapis\.com/).reply(200,
            {},
        );
    });

    test("Select a new questionnaire package file", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mockList);
        givenIHaveSelectedTheQuestionnairePacakgeToDeploy(given);

        mock_fetch_requests(mock_builder(mockList));

        whenIConfirmMySelection(when);
        thenIAmPresentedWithTheOptionsToCancelOrOverwrite(then);
    });


    test("Select to overwrite existing questionnaire when it is live", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mockList);
        givenIHaveSelectedTheQuestionnairePacakgeToDeploy(given);
        givenTheQuestionnaireIsLive(given, instrumentList, mockList);

        mock_fetch_requests(mock_builder(mockList));

        whenIConfirmMySelection(when);
        whenISelectToOverwrite(when);

        thenIGetTheQuestionnaireIsLiveWarningBanner(then);
        thenICanOnlyReturnToTheLandingPage(then);
    });


    test("Select to overwrite existing questionnaire where no data exists (the questionnaire has been deployed but the sample data has not yet been deployed)", ({
        given,
        when,
        then
    }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mockList);
        givenIHaveSelectedTheQuestionnairePacakgeToDeploy(given);

        mock_fetch_requests(mock_builder(mockList));

        whenIConfirmMySelection(when);
        whenISelectToOverwrite(when);

        thenIAmPresentedWithAConfirmOverwriteWarning(then);
    });


    test("Confirm overwrite of existing questionnaire package where no data exists (the questionnaire has been deployed but the sample data has not yet been deployed)", ({
        given,
        when,
        then,
    }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mockList);
        givenIHaveSelectedTheQuestionnairePacakgeToDeploy(given);

        mock_fetch_requests(mock_builder(mockList));

        whenIConfirmMySelection(when);
        whenISelectToOverwrite(when);
        whenIConfirmToOverwrite(when);

        thenTheQuestionnaireIsInstalled(then);
        thenIAmPresentedWithASuccessfullyDeployedBanner(then);
    });


    test("Cancel overwrite of existing questionnaire package", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mockList);
        givenIHaveSelectedTheQuestionnairePacakgeToDeploy(given);

        mock_fetch_requests(mock_builder(mockList));

        whenIConfirmMySelection(when);
        whenISelectToOverwrite(when);
        whenIConfirmNotToOverwrite(when);

        thenIAmReturnedToTheLandingPage(then);
    });
});
