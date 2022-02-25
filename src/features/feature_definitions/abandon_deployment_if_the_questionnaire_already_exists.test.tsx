/**
 * @jest-environment jsdom
 */

// Test modules
import { defineFeature, loadFeature } from "jest-cucumber";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Instrument } from "blaise-api-node-client";

import {
    givenIHaveSelectedTheQuestionnairePacakgeToDeploy,
    givenTheQuestionnaireIsInstalled,
} from "../step_definitions/given";

import {
    whenIConfirmMySelection,
    whenISelectTo,
} from "../step_definitions/when";

import {
    thenIAmPresentedWithTheOptionsToCancelOrOverwrite,
    thenIAmReturnedToTheLandingPage
} from "../step_definitions/then";
import { AuthManager } from "blaise-login-react-client";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

jest.mock("blaise-login-react-client");
AuthManager.prototype.loggedIn = jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
});

// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/abandon_deployment_if_the_questionnaire_already_exists.feature",
    { tagFilter: "not @server and not @integration" }
);

const instrumentList: Instrument[] = [];
const mocker = new MockAdapter(axios, { onNoMatch: "throwException" });


defineFeature(feature, test => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        jest.resetModules();
        mocker.reset();
    });

    beforeEach(() => {
        cleanup();
    });

    test("Questionnaire package already in Blaise", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mocker);
        givenIHaveSelectedTheQuestionnairePacakgeToDeploy(given);

        whenIConfirmMySelection(when);
        thenIAmPresentedWithTheOptionsToCancelOrOverwrite(then);
    });


    test("Back-out of deploying a questionnaire", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mocker);
        givenIHaveSelectedTheQuestionnairePacakgeToDeploy(given);

        whenIConfirmMySelection(when);
        whenISelectTo(when);
        thenIAmReturnedToTheLandingPage(then);
    });
});
