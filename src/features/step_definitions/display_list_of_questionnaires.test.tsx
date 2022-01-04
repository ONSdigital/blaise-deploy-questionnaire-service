// React
import React from "react";
// Test modules
import { defineFeature, loadFeature } from "jest-cucumber";
import { act, cleanup, render, screen } from "@testing-library/react";
import { createMemoryHistory } from "history";
import App from "../../App";
import { Router } from "react-router";
import "@testing-library/jest-dom";
// Mock elements
import flushPromises from "../../tests/utils";
import { instrumentList } from "./helpers/API_Mock_Objects";
import { mock_fetch_requests } from "./helpers/functions";


// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/display_list_of_questionnaires.feature",
    { tagFilter: "not @server and not @integration" }
);

const mock_server_responses = (url: string) => {
    console.log(url);
    if (url.includes("/upload/verify")) {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve({ name: "OPN2004A.bpkg" }),
        });
    } else if (url.includes("/api/install")) {
        return Promise.resolve({
            status: 201,
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
        mock_fetch_requests(mock_server_responses);
    });

    test("List all questionnaires in Blaise", ({ given, when, then, and }) => {
        given("I have launched the Questionnaire Deployment Service", () => {
            const history = createMemoryHistory();
            render(
                <Router history={history}>
                    <App />
                </Router>
            );

        });

        when("I view the landing page", async () => {
            await act(async () => {
                await flushPromises();
            });
        });

        then("I am presented with a list of the questionnaires already deployed to Blaise", () => {
            expect(screen.getByText(/table of questionnaires/i)).toBeDefined();
            expect(screen.getByText(/OPN2004A/i)).toBeDefined();
            expect(screen.getByText(/OPN2101A/i)).toBeDefined();
            expect(screen.getByText(/OPN2007T/i)).toBeDefined();
        });

        and("it is ordered with the most recently deployed at the top", () => {
            const list = screen.queryAllByTestId(/instrument-table-row/i);
            const listItemOne = list[0];
            const firstRowData = listItemOne.firstChild;
            if (firstRowData !== null) {
                expect(firstRowData.textContent).toEqual("OPN2004A");
            }
            const listItemTwo = list[1];
            const secondRowData = listItemTwo.firstChild;
            if (secondRowData !== null) {
                expect(secondRowData.textContent).toEqual("OPN2007T");
            }
            const listItemThree = list[2];
            const thirdRowData = listItemThree.firstChild;
            if (thirdRowData !== null) {
                expect(thirdRowData.textContent).toEqual("OPN2101A");
            }
        });
    });
});
