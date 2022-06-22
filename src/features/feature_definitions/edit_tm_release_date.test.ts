/**
 * @jest-environment jsdom
 */

import {defineFeature, loadFeature} from "jest-cucumber";
import {cleanup,} from "@testing-library/react";
import {Questionnaire} from "blaise-api-node-client";

import {AuthManager} from "blaise-login-react-client";
import axios from "axios";
import MockAdapeter from "axios-mock-adapter";
import {givenTheQuestionnaireIsInstalled, givenTheQuestionnaireHasATotalmobileReleaseDate} from "../step_definitions/given";
import {whenIGoToTheQuestionnaireDetailsPage, whenISelectToChangeOrDeleteTMReleaseDate} from "../step_definitions/when";
import {thenIamAbleToViewTheDateSelectionForm, thenThePreviouslySelectedDateIsPrepopulated} from "../step_definitions/then";

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

    test("View the Totalmobile release date if specified", ({given, when, then}) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker)
        givenTheQuestionnaireHasATotalmobileReleaseDate(given, mocker);
        whenIGoToTheQuestionnaireDetailsPage(when);
        whenISelectToChangeOrDeleteTMReleaseDate(when);
        thenIamAbleToViewTheDateSelectionForm(then);
        // thenThePreviouslySelectedDateIsPrepopulated(then)
    });
});
