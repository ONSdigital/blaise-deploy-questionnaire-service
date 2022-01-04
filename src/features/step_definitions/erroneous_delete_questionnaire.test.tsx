// React
import React from "react";
// Test modules
import { defineFeature, loadFeature } from "jest-cucumber";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
// Mock elements
import { mock_fetch_requests } from "./helpers/functions";
import { createMemoryHistory } from "history";
import { Router } from "react-router";
import App from "../../App";
import { instrumentList } from "./helpers/API_Mock_Objects";
import flushPromises from "../../tests/utils";


// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/erroneous_delete_questionnaire.feature",
    { tagFilter: "not @server and not @integration" }
);

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
            json: () => Promise.resolve({ name: "OPN2004A.bpkg" }),
        });
    } else if (url.includes("/api/install")) {
        return Promise.resolve({
            status: 500,
            json: () => Promise.resolve({}),
        });
    } else if (url.includes("/api/tostartdate/OPN2101A")) {
        return Promise.resolve({
            status: 204,
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

    test("Attempt to delete an questionnaire with an erroneous status", ({ given, when, then, and }) => {
        given("I can see the questionnaire I want to delete in the questionnaire list", async () => {
            mock_fetch_requests(mock_server_responses);
            const history = createMemoryHistory();
            render(
                <Router history={history}>
                    <App />
                </Router>
            );
            await act(async () => {
                await flushPromises();
            });
            await waitFor(() => {
                expect(screen.getByText(/OPN2004A/i)).toBeDefined();
            });
        });

        when("I select a link to delete that questionnaire", async () => {
            userEvent.click(screen.getByTestId("delete-OPN2004A"));
        });

        then("I am presented with a warning banner that I cannot delete the questionnaire and a service desk must be raised", () => {
            expect(screen.getByText(/Unable to delete questionnaire/i)).toBeDefined();
        });

        and("I am unable to delete the questionnaire", () => {
            expect(screen.queryByTestId(/confirm-delete/i)).toBeNull();
            // expect(submitButton)
        });

        and("I can return to the questionnaire list", () => {
            expect(screen.getByText(/Return to table of questionnaires/i)).toBeDefined();
            fireEvent.click(screen.getByText(/Return to table of questionnaires/i));

            expect(screen.getByText(/Table of questionnaires/i)).toBeDefined();
        });
    });


    test("Select to deploy a new questionnaire", ({ given, when, and, then }) => {
        given("I have been presented with a warning that I am about to delete a questionnaire from Blaise", async () => {
            mock_fetch_requests(mock_server_responses);
            const history = createMemoryHistory();
            render(
                <Router history={history}>
                    <App />
                </Router>
            );
            await act(async () => {
                await flushPromises();
            });
            userEvent.click(screen.getByTestId("delete-OPN2101A"));
        });

        when("I confirm that I want to proceed", async () => {
            userEvent.click(screen.getByTestId(/confirm-delete/i));
        });

        and("it failed to delete and becomes erroneous", async () => {
            await act(async () => {
                await flushPromises();
            });
        });

        then("I am presented with a warning banner informing me that the questionnaire cannot be deleted", () => {
            expect(screen.getByText(/Failed to delete the questionnaire/i)).toBeDefined();
        });
    });
});
