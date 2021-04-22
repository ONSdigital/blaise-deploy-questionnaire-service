// React
import React from "react";
// Test modules
import {defineFeature, loadFeature} from "jest-cucumber";
import {act, cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";
import "@testing-library/jest-dom";
// Mock elements
import {mock_fetch_requests} from "./functions";
import {createMemoryHistory} from "history";
import {Router} from "react-router";
import App from "../../App";
import flushPromises from "../../tests/utils";
import {Instrument} from "../../../Interfaces";


// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/erroneous_delete_questionnaire.feature",
    {tagFilter: "not @server and not @integration"}
);

const instrumentListWithErroneous: Instrument[] = [{
    name: "OPN2101A",
    serverParkName: "gusty",
    installDate: "2021-01-15T14:41:29.4399898+00:00",
    status: "Erroneous",
    dataRecordCount: 0,
    hasData: false,
    active: false,
    fieldPeriod: "January 2021"
}, {
    name: "OPN2004A",
    serverParkName: "gusty",
    installDate: "2021-01-15T15:26:43.4233454+00:00",
    status: "Active",
    dataRecordCount: 0,
    hasData: false,
    active: false,
    fieldPeriod: "April 2020"
}];

const mock_server_responses = (url: string) => {
    console.log(url);
    if (url.includes("/upload/init")) {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve("https://storage.googleapis.com"),
        });
    } else if (url.includes("/upload/verify")) {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve({name: "OPN2004A.bpkg"}),
        });
    } else if (url.includes("/api/install")) {
        return Promise.resolve({
            status: 500,
            json: () => Promise.resolve({}),
        });
    } else if (url.includes("OPN2004A")) {
        // DELETE request
        return Promise.resolve({
            status: 420,
            json: () => Promise.resolve({}),
        });
    } else {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve(instrumentListWithErroneous),

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

    test("Attempt to delete an questionnaire with an erroneous status", ({given, when, then, and}) => {
        given("I can see the questionnaire I want to delete in the questionnaire list", async () => {
            mock_fetch_requests(mock_server_responses);
            const history = createMemoryHistory();
            render(
                <Router history={history}>
                    <App/>
                </Router>
            );
            await act(async () => {
                await flushPromises();
            });
            await waitFor(() => {
                expect(screen.getByText(/OPN2101A/i)).toBeDefined();
            });
        });

        when("I select a link to delete that questionnaire", async () => {
            await fireEvent.click(screen.getByTestId("delete-OPN2101A"));
        });

        then("I am presented with a warning banner that I cannot delete the questionnaire and a service desk must be raised", () => {
            expect(screen.getByText(/Unable to delete questionnaire/i)).toBeDefined();
        });

        and("I am unable to delete the questionnaire", () => {
            expect(screen.queryByText(/yes, delete questionnaire/i)).toBeNull();
            expect(screen.queryByText(/continue/i)).toBeNull();
            // expect(submitButton)
        });
    });


    test("Select to deploy a new questionnaire", ({given, when, and, then}) => {
        given("I have been presented with a warning that I am about to delete a questionnaire from Blaise", async () => {
            mock_fetch_requests(mock_server_responses);
            const history = createMemoryHistory();
            render(
                <Router history={history}>
                    <App/>
                </Router>
            );
            await act(async () => {
                await flushPromises();
            });
            await fireEvent.click(screen.getByTestId("delete-OPN2004A"));
        });

        when("I confirm that I want to proceed", async () => {
            await fireEvent.click(screen.getByText(/yes, delete questionnaire/i));
            await fireEvent.click(screen.getByText(/continue/i));
        });

        and("it failed to delete and becomes erroneous", async () => {
            console.log("");
        });

        then("I am presented with a warning banner informing me that the questionnaire cannot be deleted", () => {
            expect(screen.getByText(/Failed to delete questionnaire/i)).toBeDefined();
        });
    });
});
