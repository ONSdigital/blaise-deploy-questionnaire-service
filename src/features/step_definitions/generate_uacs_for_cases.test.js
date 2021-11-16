import {defineFeature, loadFeature} from "jest-cucumber";
import {mock_fetch_requests} from "./functions";
import {act, cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";
import flushPromises from "../../tests/utils";
import {createMemoryHistory} from "history";
import {Router} from "react-router";
import React from "react";
import InstrumentDetails from "../../Components/InstrumentDetails/InstrumentDetails";

const feature = loadFeature(
    "./src/features/generate_uacs_for_cases.feature",
    {tagFilter: "not @server and not @integration"}
);


defineFeature(feature, test => {
    const instrumentNameWithCAWIMode = "OPN2101A";
    const instrumentNameWithCAWIModeThatFailsUACGeneration = "OPN2105F";
    const instrumentNameWithCAWIModeAndUACs = "OPN2004A";
    const instrumentNameWithoutCAWIMode = "OPN2007T";
    const fiveThousandCases = 5000;
    const modeListWithCAWI = ["CATI", "CAWI"];
    const modeListWithoutCAWI = ["CATI"];

    const generateUACsLink = /Generate and download Unique Access Codes/i;
    const UACFailedErrorMessage = /I receive an appropriate error describing suitable user actions/i;

    // Not 100% necessary for these tests, just mocking as the TO start date field will render on Instrument details page
    const toStartDate = new Date("01 Dec 2021 00:00:00 GMT");


    const mock_server_responses = (url, config) => {
        console.log(`${url} ${config?.method}`);
        if (url.includes("/api/tostartdate/")) {
            return Promise.resolve({
                status: 200,
                json: () => Promise.resolve({tostartdate: toStartDate}),
            });
        } else if (url.includes(`/api/uacs/instrument/${instrumentNameWithCAWIMode}`) && (config !== undefined && config.method === "POST")) {
            return Promise.resolve({
                status: 200,
                json: () => Promise.resolve(true),
            });
        } else if (url.includes(`/api/uacs/instrument/${instrumentNameWithCAWIModeThatFailsUACGeneration}`) && (config !== undefined && config.method === "POST")) {
            return Promise.resolve({
                status: 500,
                json: () => Promise.resolve(true),
            });
        } else if (url.includes(`/api/instruments/${instrumentNameWithCAWIModeThatFailsUACGeneration}/modes`)) {
            return Promise.resolve({
                status: 200,
                json: () => Promise.resolve(modeListWithCAWI),
            });
        } else if (url.includes(`/api/instruments/${instrumentNameWithCAWIMode}/modes`)) {
            return Promise.resolve({
                status: 200,
                json: () => Promise.resolve(modeListWithCAWI),
            });
        } else if (url.includes(`/api/instruments/${instrumentNameWithCAWIModeAndUACs}/modes`)) {
            return Promise.resolve({
                status: 200,
                json: () => Promise.resolve(modeListWithCAWI),
            });
        } else if (url.includes(`/api/instruments/${instrumentNameWithoutCAWIMode}/modes`)) {
            return Promise.resolve({
                status: 200,
                json: () => Promise.resolve(modeListWithoutCAWI),
            });
        } else if (url.includes(`/api/uacs/instrument/${instrumentNameWithCAWIModeAndUACs}/count`)) {
            return Promise.resolve({
                status: 200,
                json: () => Promise.resolve({count: fiveThousandCases}),
            });
        } else if (url.includes(`/api/uacs/instrument/${instrumentNameWithCAWIMode}/count`)) {
            return Promise.resolve({
                status: 200,
                json: () => Promise.resolve({count: 0}),
            });
        } else {
            return Promise.resolve({
                status: 404,
                json: () => Promise.resolve(),
            });
        }
    };

    beforeEach(() => {
        global.URL.createObjectURL = jest.fn();
        mock_fetch_requests(mock_server_responses);
    });

    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        jest.resetModules();
    });

    const whenIGoToTheQuestionnaireDetailsPage = (when, instrument) => {
        when("I go to the questionnaire details page", async () => {
            const history = createMemoryHistory();
            history.push("/questionnaire", {instrument: instrument});
            render(
                <Router history={history}>
                    <InstrumentDetails/>
                </Router>
            );
            await act(async () => {
                await flushPromises();
            });
        });
    };

    const thenAGenerateUacButtonIsAvailable = (then) => {
        then("A generate UAC button is available", () => {
            expect(screen.getByText(generateUACsLink)).toBeDefined();
        });
    };

    const thenAGenerateUacButtonIsNotAvailable = (then) => {
        then("A generate UAC button is not available", async () => {
            await waitFor(() => {
                expect(screen.queryAllByText(generateUACsLink)).toHaveLength(0);
            });
        });
    };

    const givenAnInstrumentIsInstalledInCawiMode = (given, instrumentName) => {
        given(/^an instrument is installed in CAWI mode$/, async () => {
            const response = await mock_server_responses(`/api/instruments/${instrumentName}/modes/CAWI`);

            expect(await response.json()).toContain(
                "CAWI"
            );
        });
    };

    const givenAnInstrumentIsInstalledInCatiMode = (given, instrumentName) => {
        given(/^an instrument is installed in CATI mode$/, async () => {
            const response = await mock_server_responses(`/api/instruments/${instrumentName}/modes/CAWI`);

            expect(await response.json()).toContain(
                "CATI"
            );
        });
    };

    const andItHasNoCases = (and, instrument) => {
        and("it has no cases", () => {
            expect(instrument.dataRecordCount).toEqual(0);
        });
    };

    const andItHasFiveThousandCases = (and, instrument) => {
        and("it has 5000 cases", () => {
            expect(instrument.dataRecordCount).toEqual(5000);
        });
    };

    const thenICanSeeThatThatTheQuestionnaireHas5000Cases = (then) => {
        then(/^I can see that that the questionnaire has 5000 cases$/, async () => {
            await waitFor(() => {
                // Should appear twice as the number 500 should show for number of cases
                // as well as number of Unique Access Codes generated
                expect(screen.queryAllByText(5000)).toHaveLength(2);
            });
        });
    };

    const andItHas5000UACs = (and, instrumentName) => {
        and(/^it has 5000 UACs$/, async () => {
            const response = await mock_server_responses(`/api/uacs/instrument/${instrumentName}/count`);

            expect(await response.json()).toEqual(
                {count: 5000}
            );
        });
    };

    const andIClickGenerateCases = (and) => {
        and("I click generate cases", async () => {
            fireEvent.click(screen.getByText(generateUACsLink));

            await act(async () => {
                await flushPromises();
            });
        });
    };


    test("Generate button exists for questionnaires with CAWI mode and cases", ({given, and, when, then}) => {
        const instrumentInCAWIModeWithCases = {
            name: instrumentNameWithCAWIMode,
            serverParkName: "gusty",
            installDate: "2021-01-15T14:41:29.4399898+00:00",
            status: "Active",
            dataRecordCount: 5000,
            fieldPeriod: "January 2021"
        };

        givenAnInstrumentIsInstalledInCawiMode(given, instrumentNameWithCAWIMode);

        andItHasFiveThousandCases(and, instrumentInCAWIModeWithCases);

        whenIGoToTheQuestionnaireDetailsPage(when, instrumentInCAWIModeWithCases);

        thenAGenerateUacButtonIsAvailable(then);
    });


    test("Generate button does not exist for questionnaires in CAWI mode without cases", ({given, and, when, then}) => {
        const instrumentInCAWIModeWithoutCases = {
            name: instrumentNameWithCAWIMode,
            serverParkName: "gusty",
            installDate: "2021-01-15T14:41:29.4399898+00:00",
            status: "Active",
            dataRecordCount: 0,
            fieldPeriod: "January 2021"
        };

        givenAnInstrumentIsInstalledInCawiMode(given, instrumentNameWithCAWIMode);

        andItHasNoCases(and, instrumentInCAWIModeWithoutCases);

        whenIGoToTheQuestionnaireDetailsPage(when, instrumentInCAWIModeWithoutCases);

        thenAGenerateUacButtonIsNotAvailable(then);
    });


    test("Generate button does not exist for questionnaires in CATI mode without cases", ({given, and, when, then}) => {
        const instrumentInCATIModeWithoutCases = {
            name: instrumentNameWithoutCAWIMode,
            serverParkName: "gusty",
            installDate: "2021-01-15T14:41:29.4399898+00:00",
            status: "Active",
            dataRecordCount: 0,
            fieldPeriod: "January 2021"
        };

        givenAnInstrumentIsInstalledInCatiMode(given, instrumentNameWithoutCAWIMode);

        andItHasNoCases(and, instrumentInCATIModeWithoutCases);

        whenIGoToTheQuestionnaireDetailsPage(when, instrumentNameWithoutCAWIMode);

        thenAGenerateUacButtonIsNotAvailable(then);
    });


    test("Generate button does not exist for questionnaires in CATI mode with cases", ({given, and, when, then}) => {
        const instrumentInCATIModeWithCases = {
            name: instrumentNameWithoutCAWIMode,
            serverParkName: "gusty",
            installDate: "2021-01-15T14:41:29.4399898+00:00",
            status: "Active",
            dataRecordCount: 5000,
            fieldPeriod: "January 2021"
        };

        givenAnInstrumentIsInstalledInCatiMode(given, instrumentNameWithoutCAWIMode);

        andItHasFiveThousandCases(and, instrumentInCATIModeWithCases);

        whenIGoToTheQuestionnaireDetailsPage(when, instrumentInCATIModeWithCases);

        thenAGenerateUacButtonIsNotAvailable(then);
    });


    test("I get a confirmation message when generating UACs", ({given, and, when, then}) => {
        const instrumentInCAWIModeWithCases = {
            name: instrumentNameWithCAWIMode,
            serverParkName: "gusty",
            installDate: "2021-01-15T14:41:29.4399898+00:00",
            status: "Active",
            dataRecordCount: 5000,
            fieldPeriod: "January 2021"
        };

        givenAnInstrumentIsInstalledInCawiMode(given, instrumentNameWithCAWIMode);

        andItHasFiveThousandCases(and, instrumentInCAWIModeWithCases);

        whenIGoToTheQuestionnaireDetailsPage(when, instrumentInCAWIModeWithCases);

        andIClickGenerateCases(and);

        then("I receive the confirmation message:", () => {
            // TODO: Improve generate UAC codes successful response in UI
            // So the UI doesn't actually come back with a success response message, It just reloads the UAC count.
            // This test is just checking that the POST request has been made.
            // I know it's not great but ¯\_(ツ)_/¯.

            expect(global.fetch).toHaveBeenCalledWith(`/api/uacs/instrument/${instrumentNameWithCAWIMode}`, {
                "method": "POST",
                "body": null,
                "headers": {"Content-Type": "application/json"}
            });
        });
    });


    test("I get a error message when generating UACs", ({given, and, when, then}) => {
        const instrumentInCAWIModeWithCases = {
            name: instrumentNameWithCAWIModeThatFailsUACGeneration,
            serverParkName: "gusty",
            installDate: "2021-01-15T14:41:29.4399898+00:00",
            status: "Active",
            dataRecordCount: 5000,
            fieldPeriod: "January 2021"
        };

        givenAnInstrumentIsInstalledInCawiMode(given, instrumentNameWithCAWIModeThatFailsUACGeneration);

        andItHasFiveThousandCases(and, instrumentInCAWIModeWithCases);

        whenIGoToTheQuestionnaireDetailsPage(when, instrumentInCAWIModeWithCases);

        andIClickGenerateCases(and);

        and("generating cases errors", () => {
            // Page blows up.
        });

        then("I receive an appropriate error describing suitable user actions", () => {
            expect(screen.getByText(UACFailedErrorMessage)).toBeDefined();
        });
    });


    test("I can see how many UACs have been generated for a particular questionnaire in the details page", (
        {given, and, when, then}) => {
        const instrumentInCAWIModeWithCases = {
            name: instrumentNameWithCAWIModeAndUACs,
            serverParkName: "gusty",
            installDate: "2021-01-15T14:41:29.4399898+00:00",
            status: "Active",
            dataRecordCount: 5000,
            fieldPeriod: "January 2021"
        };

        givenAnInstrumentIsInstalledInCawiMode(given, instrumentNameWithCAWIModeAndUACs);

        andItHasFiveThousandCases(and, instrumentInCAWIModeWithCases);

        andItHas5000UACs(and, instrumentNameWithCAWIModeAndUACs);

        whenIGoToTheQuestionnaireDetailsPage(when, instrumentInCAWIModeWithCases);

        thenICanSeeThatThatTheQuestionnaireHas5000Cases(then);

        thenAGenerateUacButtonIsAvailable(then);
    });
});
