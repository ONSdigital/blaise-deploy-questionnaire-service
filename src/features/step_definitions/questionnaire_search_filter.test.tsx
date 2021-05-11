// React
import React from "react";
// Test modules
import {defineFeature, loadFeature} from "jest-cucumber";
import {act, cleanup, fireEvent, render, screen} from "@testing-library/react";
import {createMemoryHistory} from "history";
import App from "../../App";
import {Router} from "react-router";
import "@testing-library/jest-dom";
// Mock elements
import flushPromises, {mock_server_request_Return_JSON} from "../../tests/utils";
import {instrumentList} from "./API_Mock_Objects";

// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/questionnaire_search_filter.feature",
    {tagFilter: "not @server and not @integration"}
);

defineFeature(feature, test => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        jest.resetModules();
    });

    beforeEach(() => {
        cleanup();
        mock_server_request_Return_JSON(200, instrumentList);
    });

    test("Search for a questionnaire", ({given, when, then}) => {
        given("I have launched the DQS", async () => {
            const history = createMemoryHistory();
            history.push("/?filter");
            render(
                <Router history={history}>
                    <App/>
                </Router>
            );

            await act(async () => {
                await flushPromises();
            });

            expect(screen.getByText(/table of questionnaires/i)).toBeDefined();
            expect(screen.getByText(/Filter by questionnaire name/i)).toBeDefined();
            expect(screen.getByText(/3 results of 3/i)).toBeDefined();
        });

        when("I enter the name of the survey I need to work on", async () => {
            fireEvent.change(screen.getByLabelText(/Filter by questionnaire name/i), {target: {value: "OPN2004A"}});
            await act(async () => {
                await flushPromises();
            });
        });

        then("I am presented with that survey at the top of the list", () => {
            expect(screen.getByText(/1 results of 3/i)).toBeDefined();
            expect(screen.queryByText(/OPN2004A/i)).toBeInTheDocument();
            expect(screen.queryByText(/OPN2101A/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/OPN2007T/i)).not.toBeInTheDocument();
        });
    });

    test("Questionnaire not found", ({given, when, then}) => {
        given("I have entered a questionnaire name and asked to search", async () => {
            const history = createMemoryHistory();
            // Add /?filter to url for feature toggle
            history.push("/?filter");
            render(
                <Router history={history}>
                    <App/>
                </Router>
            );

            await act(async () => {
                await flushPromises();
            });
        });

        when("that questionnaire is not found", async () => {
            fireEvent.change(screen.getByLabelText(/Filter by questionnaire name/i), {target: {value: "IPS2000"}});
            await act(async () => {
                await flushPromises();
            });
            await act(async () => {
                await flushPromises();
            });
        });

        then("I am presented with the following message: Questionnaire not found", () => {
            expect(screen.getByText(/0 results of 3/i)).toBeDefined();
            expect(screen.queryByText(/No questionnaires containing IPS2000 found/i)).toBeInTheDocument();
            expect(screen.queryByText(/OPN2004A/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/OPN2101A/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/OPN2007T/i)).not.toBeInTheDocument();
        });
    });

});
