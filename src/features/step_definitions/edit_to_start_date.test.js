import {defineFeature, loadFeature} from "jest-cucumber";
import {mock_fetch_requests, renderHomepage} from "./functions";
import {instrumentList} from "./API_Mock_Objects";
import {cleanup, fireEvent, screen, waitFor} from "@testing-library/react";

const feature = loadFeature(
    "./src/features/edit_to_start_date.feature",
    {tagFilter: "not @server and not @integration"}
);


defineFeature(feature, test => {
    const toStartDate = new Date("01 Dec 2021 00:00:00 GMT");
    const instrumentThatHasStartDate = "OPN2004A";
    const instrumentThatDoesNotHaveStartDate = "OPN2101A";


    const mock_server_responses = (url) => {
        console.log(url);
        if (url.includes(`/api/tostartdate/${instrumentThatHasStartDate}`)) {
            return Promise.resolve({
                status: 200,
                json: () => Promise.resolve({tostartdate: toStartDate}),
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

                expect(screen.getByText(/01\/12\/2021/i)).toBeDefined();
            });
        });
    };

    const iHaveTheOptionToChangeOrDeleteTheToStartDate = (then) => {
        then("I have the option to change or delete the TO Start date", async () => {
            await waitFor(() => {

                expect(screen.getByText(/Change or delete start date/i)).toBeDefined();
            });
        });
    };

    const iHaveTheOptionToAddAToStartDate = (then) => {
        then("I have the option to add a TO Start date", async () => {
            await waitFor(() => {

                expect(screen.getByText(/Add start date/i)).toBeDefined();
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
});
