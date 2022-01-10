// Test modules
import { defineFeature, loadFeature } from "jest-cucumber";
import { cleanup, } from "@testing-library/react";
import "@testing-library/jest-dom";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

import { whenIClickDeployNewQuestionnaire, whenIConfirmMySelection, whenIConfirmMySelectionNoWait, whenIDeployTheQuestionnaire, whenIHaveSelectedADeployPackage, whenILoadTheHomepage, whenISelectToInstallWithNoStartDate } from "../step_definitions/when";
import { thenIAmPresentedWithAnOptionToDeployAQuestionnaire, thenIAmPresentedWithAnOptionToDeployAQuestionnaireFile, thenIAmPresentedWithASuccessfullyDeployedBanner, thenICanSelectAQuestionnairePackageToInstall, thenTheQuestionnaireIsInstalled, thenUploadIsDisabled } from "../step_definitions/then";
import { givenIHaveSelectedTheQuestionnairePacakgeToDeploy, givenInstallsSuccessfully, givenNoQuestionnairesAreInstalled } from "../step_definitions/given";
import { Mocker } from "../step_definitions/helpers/mocker";

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/successfully_deploy_a_questionnaire.feature",
    { tagFilter: "not @server and not @integration" }
);

const mocker = new Mocker();

defineFeature(feature, test => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        jest.resetModules();
        mock.reset();
    });

    beforeEach(() => {
        mock.onPut(/^https:\/\/storage\.googleapis\.com/).reply(200);
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

        givenIHaveSelectedTheQuestionnairePacakgeToDeploy(given);
        givenInstallsSuccessfully(given, mocker);

        whenIConfirmMySelection(when);
        whenISelectToInstallWithNoStartDate(when);
        whenIDeployTheQuestionnaire(when);

        thenTheQuestionnaireIsInstalled(then);
        thenIAmPresentedWithASuccessfullyDeployedBanner(then);
    });
});
