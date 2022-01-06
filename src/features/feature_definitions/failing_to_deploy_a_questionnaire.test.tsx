// Test modules
import { defineFeature, loadFeature } from "jest-cucumber";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
// Mock elements
import {
    mock_builder,
    mock_fetch_requests,
} from "../step_definitions/helpers/functions";
import { Instrument } from "../../../Interfaces";

import { givenAllInstallsWillFail, givenIHaveSelectedTheQuestionnairePacakgeToDeploy } from "../step_definitions/given";
import { whenIConfirmMySelection } from "../step_definitions/when";
import { thenICanRetryAnInstall, thenIGetAnErrorBanner } from "../step_definitions/then";


// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/failing_to_deploy_a_questionnaire.feature",
    { tagFilter: "not @server and not @integration" }
);

const mockList: Record<string, Promise<any>> = {};

defineFeature(feature, test => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        jest.resetModules();

    });

    beforeEach(() => {
        cleanup();
    });

    test("Deployment of selected file failure", ({ given, when, then }) => {
        givenAllInstallsWillFail(given, mockList);
        givenIHaveSelectedTheQuestionnairePacakgeToDeploy(given);

        mock_fetch_requests(mock_builder(mockList));

        whenIConfirmMySelection(when);
        thenIGetAnErrorBanner(then);
    });

    test("Deploy selected file, retry following failure", ({ given, when, then }) => {
        givenAllInstallsWillFail(given, mockList);
        givenIHaveSelectedTheQuestionnairePacakgeToDeploy(given);

        mock_fetch_requests(mock_builder(mockList));

        whenIConfirmMySelection(when);
        thenIGetAnErrorBanner(then);
        thenICanRetryAnInstall(then);
    });
});
