/**
 * @jest-environment jsdom
 */

// Test modules
import { defineFeature, loadFeature } from "jest-cucumber";
import "@testing-library/jest-dom";

import { givenAllInstallsWillFail, givenIHaveSelectedTheQuestionnairePackageToDeploy } from "../step_definitions/given";
import { whenIConfirmMySelection, whenIDeploy } from "../step_definitions/when";
import { thenICanRetryAnInstall, thenIGetAnErrorBanner } from "../step_definitions/then";
import { Authenticate } from "blaise-login-react/blaise-login-react-client";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

// mock login
jest.mock("blaise-login-react/blaise-login-react-client");
const { MockAuthenticate } = jest.requireActual("blaise-login-react/blaise-login-react-client");
Authenticate.prototype.render = MockAuthenticate.prototype.render;
MockAuthenticate.OverrideReturnValues(null, true);

// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/failing_to_deploy_a_questionnaire.feature",
    { tagFilter: "not @server and not @integration" }
);

const mocker = new MockAdapter(axios);

defineFeature(feature, test => {
    afterEach(() => {
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
