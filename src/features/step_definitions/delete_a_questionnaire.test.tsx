// React
import React from "react";
// Test modules
import {defineFeature, loadFeature} from "jest-cucumber";
import {act, cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";
import "@testing-library/jest-dom";
// Mock elements
import {instrumentList} from "./API_Mock_Objects";
import {mock_fetch_requests} from "./functions";
import {createMemoryHistory} from "history";
import {Router} from "react-router";
import App from "../../App";
import flushPromises from "../../tests/utils";


// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/delete_a_questionnaire.feature",
    {tagFilter: "not @server and not @integration"}
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
            json: () => Promise.resolve({name: "OPN2004A.bpkg"}),
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
    } else if (url.includes("OPN2101A")) {
        return Promise.resolve({
            status: 204,
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

    test("Delete questionnaire not available from the list, when survey is live", ({given, when, then, and}) => {
        given("I have the name of a questionnaire I want to delete and that survey is live", async () => {
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
        });

        when("I locate that questionnaire in the list", async () => {
            await waitFor(() => {
                expect(screen.getByText(/opn2007t/i)).toBeDefined();
            });
        });

        then("I will not have the option to 'delete' displayed", () => {
            const list = screen.queryAllByTestId(/instrument-table-row/i);
            const listItemTwo = list[1];
            const secondRowData = listItemTwo.lastChild;
            if (secondRowData !== null) {
                expect(secondRowData.textContent).toEqual("Questionnaire is live");
            }
        });

        and("the landing screen displays a warning that live surveys cannot be deleted", async () => {
            await waitFor(() => {
                expect(screen.getByText(/questionnaire requires deletion, raise a Service Desk ticket to complete this request/i)).toBeDefined();
            });
        });
    });


    test("Select to delete a questionnaire from the list, when survey is NOT live", ({given, when, then}) => {
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
        });

        when("I select a link to delete that questionnaire", async () => {
            await fireEvent.click(screen.getByTestId("delete-OPN2101A"));
        });

        then("I am presented with a warning", async () => {
            await waitFor(() => {
                expect(screen.getByText(/are you sure you want to delete the questionnaire/i)).toBeDefined();
            });
        });

        test("Confirm deletion", ({given, when, then, and}) => {
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
                await fireEvent.click(screen.getByTestId("delete-OPN2101A"));
            });

            when("I confirm that I want to proceed", async () => {
                await fireEvent.click(screen.getByTestId(/confirm-delete/i));
            });

            then("the questionnaire and data is deleted from Blaise", async () => {
                await act(async () => {
                    await flushPromises();
                });
                expect(global.fetch).toHaveBeenCalledWith("/api/instruments/OPN2101A", {
                    "body": null,
                    "method": "DELETE",
                    "headers": {"Content-Type": "application/json"}
                });
            });

            and("I'm presented with a successful deletion banner on the launch page", async () => {
                await waitFor(() => {
                    expect(screen.getByText(/questionnaire: OPN2101A successfully deleted/i)).toBeDefined();
                });
            });
        });


        test("Cancel deletion", ({given, when, then, and}) => {
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
                await fireEvent.click(screen.getByTestId("delete-OPN2101A"));
            });

            when("I click cancel", async () => {
                await fireEvent.click(screen.getByTestId(/cancel-delete/i));
            });

            then("the questionnaire and data is not deleted from Blaise", () => {
                expect(global.fetch).not.toBeCalledWith("/api/instruments/OPN2101A", {"body": null, "method": "DELETE"});
            });

            and("I am returned to the landing page", async () => {
                await waitFor(() => {
                    expect(screen.getByText(/table of questionnaires/i)).toBeDefined();
                });
            });
        });
    });
});

