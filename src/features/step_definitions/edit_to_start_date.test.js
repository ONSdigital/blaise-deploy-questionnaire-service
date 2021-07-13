import {defineFeature, loadFeature} from "jest-cucumber";
import {mock_fetch_requests, renderHomepage} from "./functions";
import {instrumentList} from "./API_Mock_Objects";
import {fireEvent, screen} from "@testing-library/react";
import {waitFor} from "@babel/core/lib/gensync-utils/async";
import dateFormatter from "dayjs";


const feature = loadFeature(
    "./src/features/edit_to_start_date.feature",
    {tagFilter: "not @server and not @integration"}
);


defineFeature(feature, test => {

    const toStartDate = new Date();
    const mock_server_responses = (url) => {
        console.log(url);
        if (url.includes(`/api/tostartdate/${instrumentList[0].name}`)) {
            return Promise.resolve({
                status: 200,
                json: () => Promise.resolve({toStartDate: toStartDate}),
            });
        } else if (url.includes("/api/tostartate/")) {
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

    beforeAll(() => {
        mock_fetch_requests(mock_server_responses);
    });

    const aQuestionnaireThatHasBeenDeployed = (given) => {
        given("a questionnaire is deployed", () => {
            expect(instrumentList).toHaveLength(3);
        });
    };

    const aToStartDateHasBeenSpecified = (given) => {
        given("a TO Start date has been specified", () => {
            expect(toStartDate).not.toBeNull();
        });
    };

    const iSelectAQuestionnaire = (when) => {
        when("I select the questionnaire", async () => {
            await renderHomepage();
            await fireEvent.click(screen.getByText(instrumentList[0].name));
        });
    };

    const iCanViewTheToStartDateThatWasSpecified = (then) => {
        then("I can view the TO Start Date that was specified", async () => {
            await waitFor(() => {

                expect(screen.getByText(dateFormatter(toStartDate.toString()).format("DD/MM/YYYY"))).toBeDefined();
            });
        });
    };

    test("View TO Start Date if specified", ({given, and, when, then}) => {
        aQuestionnaireThatHasBeenDeployed(given);
        aToStartDateHasBeenSpecified(and);
        iSelectAQuestionnaire(when);
        iCanViewTheToStartDateThatWasSpecified(then);
    });
})
;
