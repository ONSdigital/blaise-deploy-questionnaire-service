// Test modules
import {defineFeature, loadFeature} from "jest-cucumber";
import {cleanup, fireEvent, screen, waitFor} from "@testing-library/react";
import "@testing-library/jest-dom";
// Mock elements
import {instrumentList} from "./API_Mock_Objects";
import navigateToDeployPageAndSelectFile, {
    mock_fetch_requests,
    navigatePastSettingTOStartDateAndStartDeployment
} from "./functions";


// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/failing_to_deploy_a_questionnaire.feature",
    {tagFilter: "not @server and not @integration"}
);

const mock_server_responses = (url: string) => {
    console.log(url);
    if (url.includes("/upload/verify")) {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve({name: "OPN2004A.bpkg"}),
        });
    } else if (url.includes("/upload")) {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve(""),
        });
    } else if (url.includes("/api/install")) {
        return Promise.resolve({
            status: 500,
            json: () => Promise.resolve({}),
        });
    } else {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve(instrumentList),
        });
    }
};

defineFeature(feature, test => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        jest.resetModules();

    });

    beforeEach(() => {
        cleanup();
    });

    test("Deployment of selected file failure", ({given, when, then}) => {
        given("I have selected the questionnaire package I wish to deploy", async () => {
            mock_fetch_requests(mock_server_responses);
            await navigateToDeployPageAndSelectFile();
        });

        when("I confirm my selection and the questionnaire fails to deploy", async () => {
            await fireEvent.click(screen.getByText(/Continue/));

            await navigatePastSettingTOStartDateAndStartDeployment();
        });

        then("I am presented with an information banner with an error message", async () => {
            await waitFor(() => {
                expect(screen.getByText("File deploy failed")).toBeDefined();
            });
        });
    });

    test("Deploy selected file, retry following failure", ({given, when, then}) => {
        given("I have selected to deploy a questionnaire package", async () => {
            mock_fetch_requests(mock_server_responses);
            await navigateToDeployPageAndSelectFile();
            fireEvent.click(screen.getByText(/Continue/));
            await navigatePastSettingTOStartDateAndStartDeployment();
        });

        when("the package fails to deploy and I'm presented with a failure message", async () => {
            await waitFor(() => {
                expect(screen.getByText("File deploy failed")).toBeDefined();
            });
        });

        then("I am able to return to the select survey package screen", async () => {
            fireEvent.click(screen.getByText(/return to select survey package page/i));
            await waitFor(() => {
                expect(screen.getByText(/deploy a questionnaire file/i)).toBeDefined();
            });
        });
    });
});
