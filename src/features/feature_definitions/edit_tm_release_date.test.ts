/**
 * @jest-environment jsdom
 */

import {defineFeature, loadFeature} from "jest-cucumber";
import {cleanup,} from "@testing-library/react";
import {Questionnaire} from "blaise-api-node-client";

import {AuthManager} from "blaise-login-react-client";
import axios from "axios";
import MockAdapeter from "axios-mock-adapter";
import {
    givenTheQuestionnaireIsInstalled,
    givenTheQuestionnaireHasATotalmobileReleaseDate
} from "../step_definitions/given";
import {
    whenIGoToTheQuestionnaireDetailsPage,
    whenIChooseToChangeOrDeleteTMReleaseDate,
    whenIDoNotSelectANewDate,
    whenIDoNotRemoveThePreSelectedDate
} from "../step_definitions/when";
import {
    thenIamAbleToViewTheDateSelectionForm,
    thenIAmReturnedToTheQuestionnaireDetailsPage,
    thenICanSelectContinueOrCancel,
    thenThePreviouslySelectedDateIsPrepopulated
} from "../step_definitions/then";

jest.mock("blaise-login-react-client");
AuthManager.prototype.loggedIn = jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
});

const feature = loadFeature(
    "./src/features/edit_tm_release_date.feature",
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

    test("View the Totalmobile release date if specified and return to the questionnaire details page", ({given, when, then}) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker)
        givenTheQuestionnaireHasATotalmobileReleaseDate(given, mocker);
        whenIGoToTheQuestionnaireDetailsPage(when);
        whenIChooseToChangeOrDeleteTMReleaseDate(when);
        thenIamAbleToViewTheDateSelectionForm(then);
        thenThePreviouslySelectedDateIsPrepopulated(then)
        thenICanSelectContinueOrCancel(then);
        //thenIAmReturnedToTheQuestionnaireDetailsPage(then)
    });

    test("Select a new release date and return to the questionnaire details page", ({given, when, then}) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker)
        givenTheQuestionnaireHasATotalmobileReleaseDate(given, mocker);
        whenIGoToTheQuestionnaireDetailsPage(when);
        whenIChooseToChangeOrDeleteTMReleaseDate(when);
        thenIamAbleToViewTheDateSelectionForm(then);
    });

    test("Select a new release date but cancel the transaction before returning to the questionnaire details page", ({given, when, then}) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker)
        givenTheQuestionnaireHasATotalmobileReleaseDate(given, mocker);
        whenIGoToTheQuestionnaireDetailsPage(when);
        whenIChooseToChangeOrDeleteTMReleaseDate(when);
        thenIamAbleToViewTheDateSelectionForm(then);
    });

    test("Delete Totalmobile release date and return to questionnaire details", ({given, when, then}) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker)
        givenTheQuestionnaireHasATotalmobileReleaseDate(given, mocker);
        whenIGoToTheQuestionnaireDetailsPage(when);
        whenIChooseToChangeOrDeleteTMReleaseDate(when);
        thenIamAbleToViewTheDateSelectionForm(then);
    });
});
