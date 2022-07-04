/**
 * @jest-environment jsdom
 */

import { defineFeature, loadFeature } from "jest-cucumber";
import { cleanup, } from "@testing-library/react";
import { givenTheQuestionnaireHasCases, givenTheQuestionnaireHasModes, givenTheQuestionnaireHasUACs, givenTheQuestionnaireIsInstalled, givenUACGenerationIsBroken } from "../step_definitions/given";
import { whenIClickGenerateCases, whenIGoToTheQuestionnaireDetailsPage } from "../step_definitions/when";
import { thenAGenerateUacButtonIsAvailable, thenAGenerateUacButtonIsNotAvailable, thenICanSeeThatThatTheQuestionnaireHasCases, thenIReceiveAUACError, thenUACsAreGenerated } from "../step_definitions/then";
import { Questionnaire } from "blaise-api-node-client";
import { AuthManager } from "blaise-login-react-client";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

jest.mock("blaise-login-react-client");
AuthManager.prototype.loggedIn = jest.fn().mockImplementation(() => {
    return Promise.resolve(true);
});

const feature = loadFeature(
    "./src/features/generate_uacs_for_cases.feature",
    { tagFilter: "not @server and not @integration" }
);

const questionnaireList: Questionnaire[] = [];
const mocker = new MockAdapter(axios, { onNoMatch: "throwException" });

defineFeature(feature, test => {
    beforeEach(() => {
        global.URL.createObjectURL = jest.fn();
        cleanup();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        cleanup();
        mocker.reset();
    });

    test("Generate button exists for questionnaires with CAWI mode and cases", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireHasModes(given, mocker);
        givenTheQuestionnaireHasCases(given, questionnaireList, mocker);

        whenIGoToTheQuestionnaireDetailsPage(when);

        thenAGenerateUacButtonIsAvailable(then);
    });

    test("Generate button does not exist for questionnaires in CAWI mode without cases", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireHasModes(given, mocker);
        givenTheQuestionnaireHasCases(given, questionnaireList, mocker);

        whenIGoToTheQuestionnaireDetailsPage(when);

        thenAGenerateUacButtonIsNotAvailable(then);
    });

    test("Generate button does not exist for questionnaires in CATI mode without cases", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireHasModes(given, mocker);
        givenTheQuestionnaireHasCases(given, questionnaireList, mocker);

        whenIGoToTheQuestionnaireDetailsPage(when);

        thenAGenerateUacButtonIsNotAvailable(then);
    });

    test("Generate button does not exist for questionnaires in CATI mode with cases", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireHasModes(given, mocker);
        givenTheQuestionnaireHasCases(given, questionnaireList, mocker);

        whenIGoToTheQuestionnaireDetailsPage(when);

        thenAGenerateUacButtonIsNotAvailable(then);
    });

    test("I get a confirmation message when generating UACs", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireHasModes(given, mocker);
        givenTheQuestionnaireHasCases(given, questionnaireList, mocker);

        whenIGoToTheQuestionnaireDetailsPage(when);
        whenIClickGenerateCases(when);

        thenUACsAreGenerated(then, mocker);
    });

    test("I get a error message when generating UACs", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireHasModes(given, mocker);
        givenTheQuestionnaireHasCases(given, questionnaireList, mocker);
        givenUACGenerationIsBroken(given, mocker);

        whenIGoToTheQuestionnaireDetailsPage(when);
        whenIClickGenerateCases(when);

        thenIReceiveAUACError(then);
    });

    test("I can see how many UACs have been generated for a particular questionnaire in the details page", (
        { given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, questionnaireList, mocker);
        givenTheQuestionnaireHasModes(given, mocker);
        givenTheQuestionnaireHasCases(given, questionnaireList, mocker);
        givenTheQuestionnaireHasUACs(given, mocker);

        whenIGoToTheQuestionnaireDetailsPage(when);
        thenICanSeeThatThatTheQuestionnaireHasCases(then);
        thenAGenerateUacButtonIsAvailable(then);
    });
});
