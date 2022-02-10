/**
 * @jest-environment jsdom
 */

// Test modules
import { defineFeature, loadFeature } from "jest-cucumber";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Instrument } from "../../../Interfaces";

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
import { Mocker } from "../step_definitions/helpers/mocker";


// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/abandon_deployment_if_the_questionnaire_already_exists.feature",
    { tagFilter: "not @server and not @integration" }
);

const instrumentList: Instrument[] = [];
const mocker = new Mocker();


defineFeature(feature, test => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        jest.resetModules();

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
