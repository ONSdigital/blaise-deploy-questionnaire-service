/**
 * @jest-environment jsdom
 */

// Test modules
import {defineFeature, loadFeature} from "jest-cucumber";
import {cleanup} from "@testing-library/react";
import "@testing-library/jest-dom";
// Mock elements
import {Questionnaire} from "blaise-api-node-client";

import {
    givenTheQuestionnaireIsInstalled,
    givenIHaveSpecifiedATotalmobileReleaseDate,
    givenIHaveNotSpecifiedATotalmobileReleaseDate
} from "../step_definitions/given";
import {
    whenIGoToTheQuestionnaireDetailsPage,
} from "../step_definitions/when";
import {
    thenIWillSeeAnEntryDisplayedForTotalmobileReleaseDate,
    thenIHaveTheOptionToChangeOrDeleteTheTotalmobileReleaseDate,
    thenIHaveTheOptionToAddATotalmobileReleaseDate
} from "../step_definitions/then";
import {AuthManager} from "blaise-login-react-client";
import axios from "axios";
import MockAdapeter from "axios-mock-adapter";

jest.mock("blaise-login-react-client");
AuthManager.prototype.loggedIn = jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
});

// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/display_totalmobile_release_date_on_questionnaire_details_page.feature",
    {tagFilter: "not @server and not @integration"}
);

const questionnaireList: Questionnaire[] = [];
const mocker = new MockAdapeter(axios);


defineFeature(feature, test => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        cleanup();
        mocker.reset();
    });

    test("View saved Totalmobile release date in questionnaire details", ({given, when, then}) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenIHaveSpecifiedATotalmobileReleaseDate(given, mocker);
        whenIGoToTheQuestionnaireDetailsPage(when);
        thenIWillSeeAnEntryDisplayedForTotalmobileReleaseDate(then);
        thenIHaveTheOptionToChangeOrDeleteTheTotalmobileReleaseDate(then);
    });

    test("Add Totalmobile release date in questionnaire details", ({given, when, then}) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenIHaveNotSpecifiedATotalmobileReleaseDate(given, mocker);
        whenIGoToTheQuestionnaireDetailsPage(when);
        thenIWillSeeAnEntryDisplayedForTotalmobileReleaseDate(then);
        thenIHaveTheOptionToAddATotalmobileReleaseDate(then);
    });
});
