/**
 * @jest-environment jsdom
 */

// Test modules
import { defineFeature, loadFeature } from "jest-cucumber";
import { cleanup, } from "@testing-library/react";
import "@testing-library/jest-dom";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

import { whenIClickDeployNewQuestionnaire, whenIConfirmMySelection, whenIConfirmMySelectionNoWait, whenIDeployTheQuestionnaire, whenIHaveSelectedADeployPackage, whenILoadTheHomepage, whenISelectToInstallWithNoStartDate } from "../step_definitions/when";
import { thenIAmPresentedWithAnOptionToDeployAQuestionnaire, thenIAmPresentedWithAnOptionToDeployAQuestionnaireFile, thenIAmPresentedWithASuccessfullyDeployedBanner, thenICanSelectAQuestionnairePackageToInstall, thenTheQuestionnaireIsInstalled, thenUploadIsDisabled } from "../step_definitions/then";
import { givenIHaveSelectedTheQuestionnairePackageToDeploy, givenInstallsSuccessfully, givenNoQuestionnairesAreInstalled } from "../step_definitions/given";
import { AuthManager } from "blaise-login-react-client";

jest.mock("blaise-login-react-client");
AuthManager.prototype.loggedIn = jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
});

const mocker = new MockAdapter(axios, { onNoMatch: "throwException" });

// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/successfully_deploy_a_questionnaire.feature",
    { tagFilter: "not @server and not @integration" }
);

defineFeature(feature, test => {
    beforeEach(() => {
        mocker.onPut(/^https:\/\/storage\.googleapis\.com/).reply(200);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        cleanup();
        mocker.reset();
    });

    test("Successful log in to Questionnaire Deployment Service", ({ given, when, then }) => {
        givenNoQuestionnairesAreInstalled(given, mocker);

        whenILoadTheHomepage(when);

        thenIAmPresentedWithAnOptionToDeployAQuestionnaire(then);
    });

    test("Select to deploy a new questionnaire", ({ given, when, then }) => {
        givenNoQuestionnairesAreInstalled(given, mocker);

        whenILoadTheHomepage(when);
        whenIClickDeployNewQuestionnaire(when);

        thenIAmPresentedWithAnOptionToDeployAQuestionnaireFile(then);
        thenICanSelectAQuestionnairePackageToInstall(then);
    });

    test("Deploy questionnaire functions disabled", ({ given, when, then }) => {
        givenNoQuestionnairesAreInstalled(given, mocker);

        whenILoadTheHomepage(when);
        whenIClickDeployNewQuestionnaire(when);
        whenIHaveSelectedADeployPackage(when);
        whenIConfirmMySelectionNoWait(when);

        thenUploadIsDisabled(then);
    });

    test("Deploy selected file", ({ given, when, then }) => {
        givenNoQuestionnairesAreInstalled(given, mocker);

        givenIHaveSelectedTheQuestionnairePackageToDeploy(given);
        givenInstallsSuccessfully(given, mocker);

        whenIConfirmMySelection(when);
        whenISelectToInstallWithNoStartDate(when);
        whenIDeployTheQuestionnaire(when);

        thenTheQuestionnaireIsInstalled(then, mocker);
        thenIAmPresentedWithASuccessfullyDeployedBanner(then);
    });
});
