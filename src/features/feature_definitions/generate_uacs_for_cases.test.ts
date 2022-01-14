import { defineFeature, loadFeature } from "jest-cucumber";
import { cleanup, } from "@testing-library/react";
import { givenTheQuestionnaireHasCases, givenTheQuestionnaireHasModes, givenTheQuestionnaireHasUACs, givenTheQuestionnaireIsInstalled, givenUACGenerationIsBroken } from "../step_definitions/given";
import { whenIClickGenerateCases, whenIGoToTheQuestionnaireDetailsPage } from "../step_definitions/when";
import { thenAGenerateUacButtonIsAvailable, thenAGenerateUacButtonIsNotAvailable, thenICanSeeThatThatTheQuestionnaireHasCases, thenIReceiveAUACError, thenUACsAreGenerated } from "../step_definitions/then";
import { Instrument } from "../../../Interfaces";
import { Mocker } from "../step_definitions/helpers/mocker";

const feature = loadFeature(
    "./src/features/generate_uacs_for_cases.feature",
    { tagFilter: "not @server and not @integration" }
);


const instrumentList: Instrument[] = [];
const mocker = new Mocker();

defineFeature(feature, test => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        jest.resetModules();

    });

    beforeEach(() => {
        global.URL.createObjectURL = jest.fn();
        cleanup();
    });

    test("Generate button exists for questionnaires with CAWI mode and cases", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mocker);
        givenTheQuestionnaireHasModes(given, mocker);
        givenTheQuestionnaireHasCases(given, instrumentList);

        whenIGoToTheQuestionnaireDetailsPage(when);

        thenAGenerateUacButtonIsAvailable(then);
    });


    test("Generate button does not exist for questionnaires in CAWI mode without cases", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mocker);
        givenTheQuestionnaireHasModes(given, mocker);
        givenTheQuestionnaireHasCases(given, instrumentList);

        whenIGoToTheQuestionnaireDetailsPage(when);

        thenAGenerateUacButtonIsNotAvailable(then);
    });


    test("Generate button does not exist for questionnaires in CATI mode without cases", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mocker);
        givenTheQuestionnaireHasModes(given, mocker);
        givenTheQuestionnaireHasCases(given, instrumentList);

        whenIGoToTheQuestionnaireDetailsPage(when);

        thenAGenerateUacButtonIsNotAvailable(then);
    });


    test("Generate button does not exist for questionnaires in CATI mode with cases", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mocker);
        givenTheQuestionnaireHasModes(given, mocker);
        givenTheQuestionnaireHasCases(given, instrumentList);

        whenIGoToTheQuestionnaireDetailsPage(when);

        thenAGenerateUacButtonIsNotAvailable(then);
    });


    test("I get a confirmation message when generating UACs", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mocker);
        givenTheQuestionnaireHasModes(given, mocker);
        givenTheQuestionnaireHasCases(given, instrumentList);

        whenIGoToTheQuestionnaireDetailsPage(when);
        whenIClickGenerateCases(when);

        thenUACsAreGenerated(then);
    });


    test("I get a error message when generating UACs", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mocker);
        givenTheQuestionnaireHasModes(given, mocker);
        givenTheQuestionnaireHasCases(given, instrumentList);
        givenUACGenerationIsBroken(given, mocker);

        whenIGoToTheQuestionnaireDetailsPage(when);
        whenIClickGenerateCases(when);

        thenIReceiveAUACError(then);
    });


    test("I can see how many UACs have been generated for a particular questionnaire in the details page", (
        { given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mocker);
        givenTheQuestionnaireHasModes(given, mocker);
        givenTheQuestionnaireHasCases(given, instrumentList);
        givenTheQuestionnaireHasUACs(given, mocker);

        whenIGoToTheQuestionnaireDetailsPage(when);
        thenICanSeeThatThatTheQuestionnaireHasCases(then);
        thenAGenerateUacButtonIsAvailable(then);
    });
});
