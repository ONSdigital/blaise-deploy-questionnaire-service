/**
 * @jest-environment jsdom
 */

// Test modules
import { defineFeature, loadFeature } from "jest-cucumber";
import "@testing-library/jest-dom";

import { givenIHaveSelectedTheQuestionnairePackageToDeploy, givenNoQuestionnairesAreInstalled, givenTOStartDateFails } from "../step_definitions/given";
import { thenIAmPresentedWithAnOptionToSpecifyATOStartDate, thenICanViewTheTOStartDateIsSetTo, thenIGetAnErrorBannerWithMessage, thenTheSummaryPageHasNoTOStartDate } from "../step_definitions/then";
import { whenIConfirmMySelection, whenIDeployTheQuestionnaire, whenISelectTheContinueButton, whenISelectToInstallWithNoStartDate, whenISpecifyATOStartDateOf } from "../step_definitions/when";
import { Authenticate } from "blaise-login-react-client";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

// mock login
jest.mock("blaise-login-react-client");
const { MockAuthenticate } = jest.requireActual("blaise-login-react-client");
Authenticate.prototype.render = MockAuthenticate.prototype.render;
MockAuthenticate.OverrideReturnValues(null, true);

// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/set_telephone_operations_start_date.feature",
    { tagFilter: "not @server and not @integration" }
);

const mocker = new MockAdapter(axios);

defineFeature(feature, test => {
    afterEach(() => {
        mocker.reset();
    });

    test("Present TO Start Date option", ({ given, when, then }) => {
        givenNoQuestionnairesAreInstalled(given, mocker);
        givenIHaveSelectedTheQuestionnairePackageToDeploy(given);

        whenIConfirmMySelection(when);

        thenIAmPresentedWithAnOptionToSpecifyATOStartDate(then);
    });

    test("Enter TO Start Date", ({ given, when, then }) => {
        givenNoQuestionnairesAreInstalled(given, mocker);
        givenIHaveSelectedTheQuestionnairePackageToDeploy(given);

        whenIConfirmMySelection(when);
        whenISpecifyATOStartDateOf(when);
        whenISelectTheContinueButton(when);

        thenICanViewTheTOStartDateIsSetTo(then);
    });

    test("Do not enter TO Start Date", ({ given, when, then }) => {
        givenNoQuestionnairesAreInstalled(given, mocker);
        givenIHaveSelectedTheQuestionnairePackageToDeploy(given);

        whenIConfirmMySelection(when);
        whenISelectToInstallWithNoStartDate(when);

        thenTheSummaryPageHasNoTOStartDate(then);
    });

    test("Setting the TO Start Date fails during deployment", ({ given, when, then }) => {
        givenNoQuestionnairesAreInstalled(given, mocker);
        givenTOStartDateFails(given, mocker);
        givenIHaveSelectedTheQuestionnairePackageToDeploy(given);

        whenIConfirmMySelection(when);
        whenISpecifyATOStartDateOf(when);
        whenISelectTheContinueButton(when);
        whenIDeployTheQuestionnaire(when);

        thenIGetAnErrorBannerWithMessage(then);
    });
});
