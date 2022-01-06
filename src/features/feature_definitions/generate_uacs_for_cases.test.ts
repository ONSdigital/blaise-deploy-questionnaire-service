import { defineFeature, loadFeature } from "jest-cucumber";
import { mock_builder, mock_fetch_requests } from "../step_definitions/helpers/functions";
import { cleanup, } from "@testing-library/react";
import { givenTheQuestionnaireHasCases, givenTheQuestionnaireHasModes, givenTheQuestionnaireHasUACs, givenTheQuestionnaireIsInstalled, givenUACGenerationIsBroken } from "../step_definitions/given";
import { whenIClickGenerateCases, whenIGoToTheQuestionnaireDetailsPage } from "../step_definitions/when";
import { thenAGenerateUacButtonIsAvailable, thenAGenerateUacButtonIsNotAvailable, thenICanSeeThatThatTheQuestionnaireHasCases, thenIReceiveAUACError, thenUACsAreGenerated } from "../step_definitions/then";
import { Instrument } from "../../../Interfaces";

const feature = loadFeature(
    "./src/features/generate_uacs_for_cases.feature",
    { tagFilter: "not @server and not @integration" }
);


const instrumentList: Instrument[] = [];
const mockList: Record<string, Promise<any>> = {};

defineFeature(feature, test => {
    afterEach(() => {
        jest.clearAllMocks();
        cleanup();
        jest.resetModules();

    });

    beforeEach(() => {
        global.URL.createObjectURL = jest.fn();
        cleanup();
    });

    // const instrumentNameWithCAWIMode = "OPN2101A";
    // const instrumentNameWithCAWIModeThatFailsUACGeneration = "OPN2105F";
    // const instrumentNameWithCAWIModeAndUACs = "OPN2004A";
    // const instrumentNameWithoutCAWIMode = "OPN2007T";
    // const fiveThousandCases = 5000;
    // const modeListWithCAWI = ["CATI", "CAWI"];
    // const modeListWithoutCAWI = ["CATI"];

    // const generateUACsLink = /Generate and download Unique Access Codes/i;
    // const UACFailedErrorMessage = /I receive an appropriate error describing suitable user actions/i;

    // Not 100% necessary for these tests, just mocking as the TO start date field will render on Instrument details page
    // const toStartDate = new Date("01 Dec 2021 00:00:00 GMT");


    // const mock_server_responses = (url, config) => {
    //     console.log(`${url} ${config?.method}`);
    //     if (url.includes("/api/tostartdate/")) {
    //         return Promise.resolve({
    //             status: 200,
    //             json: () => Promise.resolve({ tostartdate: toStartDate }),
    //         });
    //     } else if (url.includes(`/api/uacs/instrument/${instrumentNameWithCAWIMode}`) && (config !== undefined && config.method === "POST")) {
    //         return Promise.resolve({
    //             status: 200,
    //             json: () => Promise.resolve(true),
    //         });
    //     } else if (url.includes(`/api/uacs/instrument/${instrumentNameWithCAWIModeThatFailsUACGeneration}`) && (config !== undefined && config.method === "POST")) {
    //         return Promise.resolve({
    //             status: 500,
    //             json: () => Promise.resolve(true),
    //         });
    //     } else if (url.includes(`/api/instruments/${instrumentNameWithCAWIModeThatFailsUACGeneration}/modes`)) {
    //         return Promise.resolve({
    //             status: 200,
    //             json: () => Promise.resolve(modeListWithCAWI),
    //         });
    //     } else if (url.includes(`/api/instruments/${instrumentNameWithCAWIMode}/modes`)) {
    //         return Promise.resolve({
    //             status: 200,
    //             json: () => Promise.resolve(modeListWithCAWI),
    //         });
    //     } else if (url.includes(`/api/instruments/${instrumentNameWithCAWIModeAndUACs}/modes`)) {
    //         return Promise.resolve({
    //             status: 200,
    //             json: () => Promise.resolve(modeListWithCAWI),
    //         });
    //     } else if (url.includes(`/api/instruments/${instrumentNameWithoutCAWIMode}/modes`)) {
    //         return Promise.resolve({
    //             status: 200,
    //             json: () => Promise.resolve(modeListWithoutCAWI),
    //         });
    //     } else if (url.includes(`/api/uacs/instrument/${instrumentNameWithCAWIModeAndUACs}/count`)) {
    //         return Promise.resolve({
    //             status: 200,
    //             json: () => Promise.resolve({ count: fiveThousandCases }),
    //         });
    //     } else if (url.includes(`/api/uacs/instrument/${instrumentNameWithCAWIMode}/count`)) {
    //         return Promise.resolve({
    //             status: 200,
    //             json: () => Promise.resolve({ count: 0 }),
    //         });
    //     } else {
    //         return Promise.resolve({
    //             status: 404,
    //             json: () => Promise.resolve(),
    //         });
    //     }
    // };

    // beforeEach(() => {
    //     global.URL.createObjectURL = jest.fn();
    //     mock_fetch_requests(mock_server_responses);
    // });

    // afterEach(() => {
    //     jest.clearAllMocks();
    //     cleanup();
    //     jest.resetModules();
    // });

    // const whenIGoToTheQuestionnaireDetailsPage = (when, instrument) => {
    //     when("I go to the questionnaire details page", async () => {
    //         const history = createMemoryHistory();
    //         history.push("/questionnaire", { instrument: instrument });
    //         render(
    //             <Router history={ history } >
    //             <InstrumentDetails />
    //         < /Router>
    //         );
    //         await act(async () => {
    //             await flushPromises();
    //         });
    //     });
    // };

    // const thenAGenerateUacButtonIsAvailable = (then) => {
    //     then("A generate UAC button is available", () => {
    //         expect(screen.getByText(generateUACsLink)).toBeDefined();
    //     });
    // };

    // const thenAGenerateUacButtonIsNotAvailable = (then) => {
    //     then("A generate UAC button is not available", async () => {
    //         await waitFor(() => {
    //             expect(screen.queryAllByText(generateUACsLink)).toHaveLength(0);
    //         });
    //     });
    // };

    // const givenAnInstrumentIsInstalledInCawiMode = (given, instrumentName) => {
    //     given(/^an instrument is installed in CAWI mode$/, async () => {
    //         const response = await mock_server_responses(`/api/instruments/${instrumentName}/modes/CAWI`);

    //         expect(await response.json()).toContain(
    //             "CAWI"
    //         );
    //     });
    // };

    // const givenAnInstrumentIsInstalledInCatiMode = (given, instrumentName) => {
    //     given(/^an instrument is installed in CATI mode$/, async () => {
    //         const response = await mock_server_responses(`/api/instruments/${instrumentName}/modes/CAWI`);

    //         expect(await response.json()).toContain(
    //             "CATI"
    //         );
    //     });
    // };

    // const andItHasNoCases = (and, instrument) => {
    //     and("it has no cases", () => {
    //         expect(instrument.dataRecordCount).toEqual(0);
    //     });
    // };

    // const andItHasFiveThousandCases = (and, instrument) => {
    //     and("it has 5000 cases", () => {
    //         expect(instrument.dataRecordCount).toEqual(5000);
    //     });
    // };

    // const thenICanSeeThatThatTheQuestionnaireHas5000Cases = (then) => {
    //     then(/^I can see that that the questionnaire has 5000 cases$/, async () => {
    //         await waitFor(() => {
    //             // Should appear twice as the number 500 should show for number of cases
    //             // as well as number of Unique Access Codes generated
    //             expect(screen.queryAllByText(5000)).toHaveLength(2);
    //         });
    //     });
    // };

    // const andItHas5000UACs = (and, instrumentName) => {
    //     and(/^it has 5000 UACs$/, async () => {
    //         const response = await mock_server_responses(`/api/uacs/instrument/${instrumentName}/count`);

    //         expect(await response.json()).toEqual(
    //             { count: 5000 }
    //         );
    //     });
    // };

    // const andIClickGenerateCases = (and) => {
    //     and("I click generate cases", async () => {
    //         fireEvent.click(screen.getByText(generateUACsLink));

    //         await act(async () => {
    //             await flushPromises();
    //         });
    //     });
    // };


    test("Generate button exists for questionnaires with CAWI mode and cases", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mockList);
        givenTheQuestionnaireHasModes(given, mockList);
        givenTheQuestionnaireHasCases(given, instrumentList);


        mock_fetch_requests(mock_builder(mockList));

        whenIGoToTheQuestionnaireDetailsPage(when);

        thenAGenerateUacButtonIsAvailable(then);
    });


    test("Generate button does not exist for questionnaires in CAWI mode without cases", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mockList);
        givenTheQuestionnaireHasModes(given, mockList);
        givenTheQuestionnaireHasCases(given, instrumentList);

        mock_fetch_requests(mock_builder(mockList));

        whenIGoToTheQuestionnaireDetailsPage(when);

        thenAGenerateUacButtonIsNotAvailable(then);
    });


    test("Generate button does not exist for questionnaires in CATI mode without cases", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mockList);
        givenTheQuestionnaireHasModes(given, mockList);
        givenTheQuestionnaireHasCases(given, instrumentList);

        mock_fetch_requests(mock_builder(mockList));

        whenIGoToTheQuestionnaireDetailsPage(when);

        thenAGenerateUacButtonIsNotAvailable(then);
    });


    test("Generate button does not exist for questionnaires in CATI mode with cases", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mockList);
        givenTheQuestionnaireHasModes(given, mockList);
        givenTheQuestionnaireHasCases(given, instrumentList);

        mock_fetch_requests(mock_builder(mockList));

        whenIGoToTheQuestionnaireDetailsPage(when);

        thenAGenerateUacButtonIsNotAvailable(then);
    });


    test("I get a confirmation message when generating UACs", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mockList);
        givenTheQuestionnaireHasModes(given, mockList);
        givenTheQuestionnaireHasCases(given, instrumentList);

        mock_fetch_requests(mock_builder(mockList));

        whenIGoToTheQuestionnaireDetailsPage(when);
        whenIClickGenerateCases(when);

        thenUACsAreGenerated(then);
    });


    test("I get a error message when generating UACs", ({ given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mockList);
        givenTheQuestionnaireHasModes(given, mockList);
        givenTheQuestionnaireHasCases(given, instrumentList);
        givenUACGenerationIsBroken(given, mockList);

        mock_fetch_requests(mock_builder(mockList));

        whenIGoToTheQuestionnaireDetailsPage(when);
        whenIClickGenerateCases(when);

        thenIReceiveAUACError(then);
    });


    test("I can see how many UACs have been generated for a particular questionnaire in the details page", (
        { given, when, then }) => {
        givenTheQuestionnaireIsInstalled(given, instrumentList, mockList);
        givenTheQuestionnaireHasModes(given, mockList);
        givenTheQuestionnaireHasCases(given, instrumentList);
        givenTheQuestionnaireHasUACs(given, mockList);

        mock_fetch_requests(mock_builder(mockList));

        whenIGoToTheQuestionnaireDetailsPage(when);
        thenICanSeeThatThatTheQuestionnaireHasCases(then);
        thenAGenerateUacButtonIsAvailable(then);
    });
});
