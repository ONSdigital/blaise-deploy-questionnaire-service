// Test modules
import { defineFeature, loadFeature } from "jest-cucumber";
import { act, cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
// Mock elements
import { instrumentList } from "./API_Mock_Objects";
import navigateToDeployPageAndSelectFile, { mock_fetch_requests } from "./functions";
import flushPromises from "../../tests/utils";


// Load in feature details from .feature file
const feature = loadFeature(
    "./src/features/set_telephone_operations_start_date.feature",
    { tagFilter: "not @server and not @integration" }
);

const mock_server_responses = (url: string) => {
    console.log(url);
    if (url.includes("/upload/verify")) {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve({ name: "OPN2004A.bpkg" }),
        });
    } else if (url.includes("/api/tostartdate")) {
        return Promise.resolve({
            status: 500,
            json: () => Promise.resolve({}),
        });
    } else if (url.includes("/upload")) {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve(""),
        });
    } else if (url.includes("/api/install")) {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve({}),
        });
    } else if (url.includes("/api/instruments/OPN2004A/modes")) {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve(["CATI", "CAWI"]),
        });
    } else if (url.includes("/api/instruments/OPN2004A/settings")) {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve([
                {
                    type: "StrictInterviewing",
                    saveSessionOnTimeout: true,
                    saveSessionOnQuit: true,
                    deleteSessionOnTimeout: true,
                    deleteSessionOnQuit: true,
                    sessionTimeout: 15,
                    applyRecordLocking: true
                }
            ]),
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

    test("Present TO Start Date option", ({ given, when, then }) => {
        given("a questionnaire is deployed using DQS", () => {
            mock_fetch_requests(mock_server_responses);
        });

        when("I select a file to deploy", async () => {
            await navigateToDeployPageAndSelectFile();
            userEvent.click(screen.getByText(/Continue/));
        });

        then("I am presented with an option to specify a TO Start Date", async () => {

        });
    });


    test("Enter TO Start Date", ({ given, when, then, and }) => {
        given("I am presented with an option to specify a TO Start Date", async () => {
            mock_fetch_requests(mock_server_responses);
            await navigateToDeployPageAndSelectFile();
            userEvent.click(screen.getByText(/Continue/));
            await waitFor(() => {
                expect(screen.getByText(/Would you like to set a telephone operations start date/i)).toBeDefined();
            });
        });

        when("I enter a date", async () => {
            userEvent.click(screen.getByText(/Yes, let me specify a start date/i));

            fireEvent.change(screen.getByLabelText(/Please specify date/i), { target: { value: "2030-06-05" } });

            userEvent.click(screen.getByText(/Continue/));

            await act(async () => {
                await flushPromises();
            });
        });

        then("the date is stored against the questionnaire", () => {
            return;
        });

        and("displayed in DQS against the questionnaire information", async () => {
            await waitFor(() => {
                expect(screen.getByText(/Deployment summary/i)).toBeDefined();
                expect(screen.getByText(/Start date set to 05\/06\/2030/i)).toBeDefined();
            });
        });
    });


    test("Do not enter TO Start Date", ({ given, when, then }) => {
        given("I am presented with an option to specify a live date", async () => {
            mock_fetch_requests(mock_server_responses);
            await navigateToDeployPageAndSelectFile();
            userEvent.click(screen.getByText(/Continue/));
            await act(async () => {
                await flushPromises();
            });
        });

        when("I select to not provide a TO Start Date", async () => {
            userEvent.click(screen.getByText(/No start date/i));
            userEvent.click(screen.getByText(/Continue/));

            await act(async () => {
                await flushPromises();
            });
        });

        then("the questionnaire is deployed without a TO Start Date", async () => {
            await waitFor(() => {
                expect(screen.getByText(/Deployment summary/i)).toBeDefined();
                expect(screen.getByText(/Start date not specified/i)).toBeDefined();
            });
        });
    });


    test("Setting the TO Start Date fails during deployment", ({ given, when, then, and }) => {
        given("I have selected the questionnaire package I wish to deploy", async () => {
            mock_fetch_requests(mock_server_responses);
            await navigateToDeployPageAndSelectFile();

            userEvent.click(screen.getByText(/Continue/));
            await act(async () => {
                await flushPromises();
            });
        });

        and("set a TO Start Date", async () => {
            userEvent.click(screen.getByText(/Yes, let me specify a start date/i));

            fireEvent.change(screen.getByLabelText(/Please specify date/i), { target: { value: "2030-06-05" } });

            userEvent.click(screen.getByText(/Continue/));

            await act(async () => {
                await flushPromises();
            });
        });

        when("I confirm my selection", async () => {
            userEvent.click(screen.getByText(/Deploy questionnaire/));

            await act(async () => {
                await flushPromises();
            });
        });

        and("the set TO Start Date fails", () => {
            return;
        });

        then("I am presented with an information banner with an error message", async () => {
            await waitFor(() => {
                expect(screen.getByText("File deploy failed")).toBeDefined();
                expect(screen.getByText(/Failed to store telephone operations start date specified/i)).toBeDefined();
            });
        });

    });
});
