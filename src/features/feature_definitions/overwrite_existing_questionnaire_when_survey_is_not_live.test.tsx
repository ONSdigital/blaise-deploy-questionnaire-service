/**
 * @jest-environment jsdom
 */

// Test modules
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { defineFeature, loadFeature } from "jest-cucumber";
import { Instrument } from "blaise-api-node-client";

import { givenIHaveSelectedTheQuestionnairePacakgeToDeploy, givenTheQuestionnaireIsInstalled, givenTheQuestionnaireIsLive } from "../step_definitions/given";
import { Mocker } from "../step_definitions/helpers/mocker";
import { thenIAmPresentedWithAConfirmOverwriteWarning, thenIAmPresentedWithASuccessfullyDeployedBanner, thenIAmPresentedWithTheOptionsToCancelOrOverwrite, thenIAmReturnedToTheLandingPage, thenICanOnlyReturnToTheLandingPage, thenIGetTheQuestionnaireIsLiveWarningBanner, thenTheQuestionnaireIsInstalled } from "../step_definitions/then";
import { whenIConfirmMySelection, whenIConfirmNotToOverwrite, whenIConfirmToOverwrite, whenISelectToOverwrite } from "../step_definitions/when";
import { AuthManager } from "blaise-login-react-client";

jest.mock("blaise-login-react-client");
AuthManager.prototype.loggedIn = jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
});

const mocker = new MockAdapter(axios, { onNoMatch: "throwException" });


// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/overwrite_existing_questionnaire_when_survey_is_not_live.feature",
    { tagFilter: "not @server and not @integration" }
);


const instrumentList: Instrument[] = [];

defineFeature(feature, test => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        jest.resetModules();
        mocker.reset();
    });

    beforeEach(() => {
        cleanup();
        mocker.onPut(/^https:\/\/storage\.googleapis\.com/).reply(200,
            {},
        );
    });

    test("Select a new questionnaire package file", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mocker);
        givenIHaveSelectedTheQuestionnairePacakgeToDeploy(given);

        whenIConfirmMySelection(when);
        thenIAmPresentedWithTheOptionsToCancelOrOverwrite(then);
    });


    test("Select to overwrite existing questionnaire when it is live", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mocker);
        givenIHaveSelectedTheQuestionnairePacakgeToDeploy(given);
        givenTheQuestionnaireIsLive(given, instrumentList, mocker);

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
        givenTheQuestionnaireIsInstalled(given, instrumentList, mocker);
        givenIHaveSelectedTheQuestionnairePacakgeToDeploy(given);

        whenIConfirmMySelection(when);
        whenISelectToOverwrite(when);

        thenIAmPresentedWithAConfirmOverwriteWarning(then);
    });


    test("Confirm overwrite of existing questionnaire package where no data exists (the questionnaire has been deployed but the sample data has not yet been deployed)", ({
        given,
        when,
        then,
    }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mocker);
        givenIHaveSelectedTheQuestionnairePacakgeToDeploy(given);

        whenIConfirmMySelection(when);
        whenISelectToOverwrite(when);
        whenIConfirmToOverwrite(when);

        thenTheQuestionnaireIsInstalled(then, mocker);
        thenIAmPresentedWithASuccessfullyDeployedBanner(then);
    });


    test("Cancel overwrite of existing questionnaire package", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mocker);
        givenIHaveSelectedTheQuestionnairePacakgeToDeploy(given);

        whenIConfirmMySelection(when);
        whenISelectToOverwrite(when);
        whenIConfirmNotToOverwrite(when);

        thenIAmReturnedToTheLandingPage(then);
    });
});
