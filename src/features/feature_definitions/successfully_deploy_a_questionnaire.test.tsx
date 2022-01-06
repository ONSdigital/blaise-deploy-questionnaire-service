// React
import React from "react";
// Test modules
import { defineFeature, loadFeature } from "jest-cucumber";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryHistory } from "history";
import "@testing-library/jest-dom";
// Mock elements
import {
    mock_builder,
    mock_fetch_requests,
} from "../step_definitions/helpers/functions";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

import { whenIClickDeployNewQuestionnaire, whenIConfirmMySelection, whenIConfirmMySelectionNoWait, whenIDeployTheQuestionnaire, whenIHaveSelectedADeployPackage, whenILoadTheHomepage, whenISelectToInstallWithNoStartDate } from "../step_definitions/when";
import { thenIAmPresentedWithAnOptionToDeployAQuestionnaire, thenIAmPresentedWithAnOptionToDeployAQuestionnaireFile, thenIAmPresentedWithASuccessfullyDeployedBanner, thenICanSelectAQuestionnairePackageToInstall, thenTheQuestionnaireIsInstalled, thenUploadIsDisabled } from "../step_definitions/then";
import { givenIHaveSelectedTheQuestionnairePacakgeToDeploy, givenInstallsSuccessfully, givenNoQuestionnairesAreInstalled } from "../step_definitions/given";

const mock = new MockAdapter(axios, { onNoMatch: "throwException" });

// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/successfully_deploy_a_questionnaire.feature",
    { tagFilter: "not @server and not @integration" }
);


const mockList: Record<string, Promise<any>> = {};
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

    test("Successful log in to Questionnaire Deployment Service", ({ when, then }) => {
        whenILoadTheHomepage(when);

        thenIAmPresentedWithAnOptionToDeployAQuestionnaire(then);
    });

    test("Select to deploy a new questionnaire", ({ when, then }) => {
        whenILoadTheHomepage(when);
        whenIClickDeployNewQuestionnaire(when);

        thenIAmPresentedWithAnOptionToDeployAQuestionnaireFile(then);
        thenICanSelectAQuestionnairePackageToInstall(then);
    });


    test("Deploy questionnaire functions disabled", ({ when, then }) => {
        whenILoadTheHomepage(when);
        whenIClickDeployNewQuestionnaire(when);
        whenIHaveSelectedADeployPackage(when);
        whenIConfirmMySelectionNoWait(when);

        thenUploadIsDisabled(then);
    });


    test("Deploy selected file", ({ given, when, then }) => {
        givenNoQuestionnairesAreInstalled(given, mockList);
        givenIHaveSelectedTheQuestionnairePacakgeToDeploy(given);
        givenInstallsSuccessfully(given, mockList);

        mock_fetch_requests(mock_builder(mockList));

        whenIConfirmMySelection(when);
        whenISelectToInstallWithNoStartDate(when);
        whenIDeployTheQuestionnaire(when);

        thenTheQuestionnaireIsInstalled(then);
        thenIAmPresentedWithASuccessfullyDeployedBanner(then);
    });
});
