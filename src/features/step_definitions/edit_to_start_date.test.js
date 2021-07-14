import {defineFeature, loadFeature} from "jest-cucumber";
import {mock_fetch_requests, renderHomepage} from "./functions";
import {instrumentList} from "./API_Mock_Objects";
import {act, cleanup, fireEvent, screen, waitFor} from "@testing-library/react";
import dateFormatter from "dayjs";
import flushPromises from "../../tests/utils";

const feature = loadFeature(
    "./src/features/edit_to_start_date.feature",
    {tagFilter: "not @server and not @integration"}
);


defineFeature(feature, test => {
    const changeOrDeleteLink = /Change or delete start date/i;
    const addLink = /Add start date/i;
    const continueButton = /continue/i;
    const noToStartDateRadioOption = /No start date/i;

    const toStartDate = new Date("01 Dec 2021 00:00:00 GMT");
    const toStartDateFormatted = /01\/12\/2021/i;
    const newToStartDate = new Date("23 Jan 2021 00:00:00 GMT");
    const newToStartDateValue = "2021-01-23";
    const instrumentThatHasStartDate = "OPN2004A";
    const instrumentThatDoesNotHaveStartDate = "OPN2101A";


    const mock_server_responses = (url, config) => {
        console.log(`${url} ${config?.method}`);
        if (url.includes(`/api/tostartdate/${instrumentThatHasStartDate}`)) {
            return Promise.resolve({
                status: 200,
                json: () => Promise.resolve({tostartdate: toStartDate}),
            });
        } else if (url.includes(`/api/tostartdate/${instrumentThatDoesNotHaveStartDate}`) && (config !== undefined && config.method === "POST")) {
            return Promise.resolve({
                status: 200,
                json: () => Promise.resolve({}),
            });
        } else if (url.includes("/api/tostartdate")) {
            return Promise.resolve({
                status: 404,
                json: () => Promise.resolve({}),
            });
        } else {
            return Promise.resolve({
                status: 200,
                json: () => Promise.resolve(instrumentList),
            });
        }
    };

    beforeEach(() => {
        mock_fetch_requests(mock_server_responses);
    });

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        jest.resetModules();
    });

    const aQuestionnaireThatHasBeenDeployed = (given) => {
        given("a questionnaire is deployed", () => {
            expect(instrumentList).toHaveLength(3);

            expect(instrumentList).toEqual(expect.arrayContaining(
                [expect.objectContaining({"name": instrumentThatHasStartDate})]
            ));
            expect(instrumentList).toEqual(expect.arrayContaining(
                [expect.objectContaining({"name": instrumentThatDoesNotHaveStartDate})]
            ));
        });
    };

    const aToStartDateHasBeenSpecified = (given, instrumentName) => {
        given("a TO Start date has been specified", async () => {
            expect(await mock_server_responses(`/api/tostartdate/${instrumentName}`)).toEqual(expect.objectContaining(
                {status: 200}
            ));
        });
    };

    const noToStartDateHasBeenSpecified = (given, instrumentName) => {
        given("no TO Start date has been specified", async () => {
            expect(await mock_server_responses(`/api/tostartdate/${instrumentName}`)).toEqual(expect.objectContaining(
                {status: 404}
            ));
        });
    };

    const iSelectAQuestionnaire = (when, instrumentName) => {
        when("I select the questionnaire", async () => {
            await renderHomepage();
            await fireEvent.click(screen.getByText(instrumentName));
        });
    };

    const iCanViewTheToStartDateThatWasSpecified = (then) => {
        then("I can view the TO Start Date that was specified", async () => {
            await waitFor(() => {

                expect(screen.getByText(toStartDateFormatted)).toBeDefined();
            });
        });
    };

    const iHaveTheOptionToChangeOrDeleteTheToStartDate = (then) => {
        then("I have the option to change or delete the TO Start date", async () => {
            await waitFor(() => {

                expect(screen.getByText(changeOrDeleteLink)).toBeDefined();
            });
        });
    };

    const iHaveTheOptionToAddAToStartDate = (then) => {
        then("I have the option to add a TO Start date", async () => {
            await waitFor(() => {

                expect(screen.getByText(addLink)).toBeDefined();
            });
        });
    };

    const iHaveSelectedToChangeOrDeleteAToStartDateForADeployedQuestionnaire = (given, instrumentName) => {
        given("I have selected to change or delete a TO Start Date for a deployed questionnaire", async () => {
            await renderHomepage();
            await fireEvent.click(screen.getByText(instrumentName));
            await act(async () => {
                await flushPromises();
            });
            await fireEvent.click(screen.getByText(changeOrDeleteLink));
        });
    };

    const iHaveSelectedToAddAToStartDateForADeployedQuestionnaire = (given, instrumentName) => {
        given("I have selected to add a TO Start Date for a deployed questionnaire", async () => {
            await renderHomepage();
            await fireEvent.click(screen.getByText(instrumentName));
            await act(async () => {
                await flushPromises();
            });
            await fireEvent.click(screen.getByText(addLink));
        });
    };

    const iSpecifyAToStartDate = (and) => {
        and("I specify a TO Start Date", async () => {

            await fireEvent.click(screen.getByText(/Yes, let me specify a start date/i));
            await fireEvent.change(screen.getByLabelText(/Please specify date/i),
                {
                    target: {value: newToStartDateValue}
                });
            await act(async () => {
                await flushPromises();
            });
        });
    };

    const iSelectTheContinueButton = (when) => {
        when("I select the continue button", async () => {
            await fireEvent.click(screen.getByText(continueButton));
            await act(async () => {
                await flushPromises();
            });
        });
    };

    const iDeleteTheToStartDate = (and) => {
        and("I delete the TO start date", async () => {
            await fireEvent.click(screen.getByText(noToStartDateRadioOption));
            await act(async () => {
                await flushPromises();
            });
        });
    };

    const theToStartDateIsStoredAgainstTheQuestionnaire = (then, instrumentName) => {
        then("The TO start date is stored against the questionnaire", async () => {
            await waitFor(() => {
                expect(screen.getByText(/Questionnaire details/i)).toBeDefined();
                expect(global.fetch).toHaveBeenCalledWith(`/api/tostartdate/${instrumentName}`, {
                    "body": JSON.stringify({"tostartdate": newToStartDateValue}),
                    "method": "POST",
                    "headers": {"Content-Type": "application/json"}
                });
            });
        });
    };

    const theToStartDateIsDeletedFromTheQuestionnaire = (then, instrumentName) => {
        then("The TO start date is deleted from the questionnaire", async () => {
            await waitFor(() => {
                expect(screen.getByText(/Questionnaire details/i)).toBeDefined();
                expect(global.fetch).toHaveBeenCalledWith(`/api/tostartdate/${instrumentName}`, {
                    "body": JSON.stringify({"tostartdate": ""}),
                    "method": "POST",
                    "headers": {"Content-Type": "application/json"}
                });
            });
        });
    };


    test("View TO Start Date if specified", ({given, and, when, then}) => {
        aQuestionnaireThatHasBeenDeployed(given);
        aToStartDateHasBeenSpecified(and, instrumentThatHasStartDate);
        iSelectAQuestionnaire(when, instrumentThatHasStartDate);
        iCanViewTheToStartDateThatWasSpecified(then);
    });

    test("Change TO Start Date if specified", ({given, and, when, then}) => {
        aQuestionnaireThatHasBeenDeployed(given);
        aToStartDateHasBeenSpecified(and, instrumentThatHasStartDate);
        iSelectAQuestionnaire(when, instrumentThatHasStartDate);
        iHaveTheOptionToChangeOrDeleteTheToStartDate(then);
    });

    test("Add TO Start Date if not previously specified", ({given, and, when, then}) => {
        aQuestionnaireThatHasBeenDeployed(given);
        noToStartDateHasBeenSpecified(and, instrumentThatDoesNotHaveStartDate);
        iSelectAQuestionnaire(when, instrumentThatDoesNotHaveStartDate);
        iHaveTheOptionToAddAToStartDate(then);
    });

    test("Change an existing TO Start Date for a deployed questionnaire", ({given, and, when, then}) => {
        iHaveSelectedToChangeOrDeleteAToStartDateForADeployedQuestionnaire(given, instrumentThatHasStartDate);
        iSpecifyAToStartDate(and);
        iSelectTheContinueButton(when);
        theToStartDateIsStoredAgainstTheQuestionnaire(then, instrumentThatHasStartDate);
    });

    test("Delete a TO start date from a deployed questionnaire", ({given, and, when, then}) => {
        iHaveSelectedToChangeOrDeleteAToStartDateForADeployedQuestionnaire(given, instrumentThatHasStartDate);
        iDeleteTheToStartDate(and);
        iSelectTheContinueButton(when);
        theToStartDateIsDeletedFromTheQuestionnaire(then, instrumentThatHasStartDate);
    });

    test("Add a TO Start Date to a deployed questionnaire", ({given, and, when, then}) => {
        iHaveSelectedToAddAToStartDateForADeployedQuestionnaire(given, instrumentThatDoesNotHaveStartDate);
        iSpecifyAToStartDate(and);
        iSelectTheContinueButton(when);
        theToStartDateIsStoredAgainstTheQuestionnaire(then, instrumentThatDoesNotHaveStartDate);
    });
});
