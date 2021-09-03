// Test modules
import {defineFeature, loadFeature} from "jest-cucumber";
import {act, cleanup, fireEvent, screen, waitFor} from "@testing-library/react";
import "@testing-library/jest-dom";
// Mock elements
import {instrumentList} from "./API_Mock_Objects";
import navigateToDeployPageAndSelectFile, {mock_fetch_requests} from "./functions";
import flushPromises from "../../tests/utils";


// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/abandon_deployment_if_the_questionnaire_already_exists.feature",
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
            json: () => Promise.resolve(),
        });
    } else if (url.includes("/api/install")) {
        return Promise.resolve({
            status: 201,
            json: () => Promise.resolve({}),
        });
    } else if (url.includes("/api/instruments/OPN2004A")) {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve({name: "OPN2004A", active: true}),
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
        mock_fetch_requests(mock_server_responses);
    });

    test("Questionnaire package already in Blaise", ({given, when, then}) => {
        given("I have selected the questionnaire package I wish to deploy", async () => {
            await navigateToDeployPageAndSelectFile();

        });

        when("I confirm my selection and the name/ref of the questionnaire package is the same as one already deployed in Blaise", async () => {
            await fireEvent.click(screen.getByText(/Continue/));
        });

        then("I am presented with the options to cancel or overwrite the questionnaire", async () => {
            await waitFor((() => {
                expect(screen.getByText(/already exists in the system/i)).toBeDefined();
                expect(screen.getByText("Overwrite the entire questionnaire")).toBeDefined();
            }));
        });
    });


    test("Back-out of deploying a questionnaire", ({given, when, then}) => {
        given("I have been presented with the options: Cancel or Overwrite", async () => {
            await navigateToDeployPageAndSelectFile();
            await fireEvent.click(screen.getByText(/Continue/));
            await act(async () => {
                await flushPromises();
            });
        });

        when("I select to 'cancel'", async () => {
            await fireEvent.click(screen.getByText("Cancel and keep original questionnaire"));
            await fireEvent.click(screen.getByText(/Continue/));
        });

        then("I am returned to the landing page", async () => {
            await waitFor((() => {
                expect(screen.getByText(/table of questionnaires/i)).toBeDefined();
            }));
        });
    });
})
;
