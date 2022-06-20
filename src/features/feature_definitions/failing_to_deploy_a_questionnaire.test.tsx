/**
 * @jest-environment jsdom
 */

// Test modules
import { defineFeature, loadFeature } from "jest-cucumber";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";

import { givenAllInstallsWillFail, givenIHaveSelectedTheQuestionnairePackageToDeploy } from "../step_definitions/given";
import { whenIConfirmMySelection, whenIDeploy } from "../step_definitions/when";
import { thenICanRetryAnInstall, thenIGetAnErrorBanner } from "../step_definitions/then";
import { AuthManager } from "blaise-login-react-client";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

jest.mock("blaise-login-react-client");
AuthManager.prototype.loggedIn = jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
});

// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/failing_to_deploy_a_questionnaire.feature",
    { tagFilter: "not @server and not @integration" }
);

const mocker = new MockAdapter(axios);

defineFeature(feature, test => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        cleanup();
        mocker.reset();
    });

    test("Deployment of selected file failure", ({ given, when, then }) => {
        givenAllInstallsWillFail(given, mocker);
        givenIHaveSelectedTheQuestionnairePackageToDeploy(given);

        whenIConfirmMySelection(when);
        whenIDeploy(when);

        thenIGetAnErrorBanner(then);
    });

    test("Deploy selected file, retry following failure", ({ given, when, then }) => {
        givenAllInstallsWillFail(given, mocker);
        givenIHaveSelectedTheQuestionnairePackageToDeploy(given);

        whenIConfirmMySelection(when);
        whenIDeploy(when);

        thenIGetAnErrorBanner(then);
        thenICanRetryAnInstall(then);
    });
});
