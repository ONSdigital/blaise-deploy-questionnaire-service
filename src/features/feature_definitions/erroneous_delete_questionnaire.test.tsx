// Test modules
import { defineFeature, loadFeature } from "jest-cucumber";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
// Mock elements
import { Instrument } from "../../../Interfaces";

import { givenTheQuestionnaireCannotBeDeletedBecauseItWillGoErroneous, givenTheQuestionnaireIsErroneous, givenTheQuestionnaireIsInstalled } from "../step_definitions/given";
import { whenIConfirmDelete, whenIDeleteAQuestionnaire, whenILoadTheHomepage } from "../step_definitions/when";
import { thenIAmPresentedWithACannotDeleteWarning, thenIAmPresentedWithAUnableDeleteWarning, thenIAmUnableToDeleteTheQuestionnaire, thenICanReturnToTheQuestionnaireList } from "../step_definitions/then";
import { Mocker } from "../step_definitions/helpers/mocker";


// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/erroneous_delete_questionnaire.feature",
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
        cleanup();
    });

    test("Attempt to delete an questionnaire with an erroneous status", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mocker);
        givenTheQuestionnaireIsErroneous(given, instrumentList);

        whenILoadTheHomepage(when);
        whenIDeleteAQuestionnaire(when);
        thenIAmPresentedWithAUnableDeleteWarning(then);
        thenIAmUnableToDeleteTheQuestionnaire(then);
        thenICanReturnToTheQuestionnaireList(then);
    });


    test("Select to deploy a new questionnaire", ({ given, when, and, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mocker);
        givenTheQuestionnaireCannotBeDeletedBecauseItWillGoErroneous(when, mocker);

        whenILoadTheHomepage(when);
        whenIDeleteAQuestionnaire(when);
        whenIConfirmDelete(when);

        thenIAmPresentedWithACannotDeleteWarning(then);
    });
});
