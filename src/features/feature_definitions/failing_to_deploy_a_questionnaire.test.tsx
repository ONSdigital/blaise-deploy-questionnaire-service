/**
 * @jest-environment jsdom
 */

// Test modules
import { defineFeature, loadFeature } from "jest-cucumber";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";

import { givenAllInstallsWillFail, givenIHaveSelectedTheQuestionnairePacakgeToDeploy } from "../step_definitions/given";
import { whenIConfirmMySelection } from "../step_definitions/when";
import { thenICanRetryAnInstall, thenIGetAnErrorBanner } from "../step_definitions/then";
import { Mocker } from "../step_definitions/helpers/mocker";


// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/failing_to_deploy_a_questionnaire.feature",
    { tagFilter: "not @server and not @integration" }
);

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

    test("Deployment of selected file failure", ({ given, when, then }) => {
        givenAllInstallsWillFail(given, mocker);
        givenIHaveSelectedTheQuestionnairePacakgeToDeploy(given);

        whenIConfirmMySelection(when);
        thenIGetAnErrorBanner(then);
    });

    test("Deploy selected file, retry following failure", ({ given, when, then }) => {
        givenAllInstallsWillFail(given, mocker);
        givenIHaveSelectedTheQuestionnairePacakgeToDeploy(given);

        whenIConfirmMySelection(when);
        thenIGetAnErrorBanner(then);
        thenICanRetryAnInstall(then);
    });
});
