import {defineFeature, loadFeature} from "jest-cucumber";
import {mock_fetch_requests} from "./functions";
import {instrumentList} from "./API_Mock_Objects";


const feature = loadFeature(
    "./src/features/edit_to_start_date.feature",
    {tagFilter: "not @server and not @integration"}
);


const mock_server_responses = (url: string) => {
    console.log(url);
    if (url.includes("/api/tostartdate")) {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve({toStartDate: "date!!"}),
        });
    } else {
        return Promise.resolve({
            status: 200,
            json: () => Promise.resolve(instrumentList),
        });
    }
};

defineFeature(feature, test => {


    test('View TO Start Date if specified', ({given, and, when, then}) => {
        given('a questionnaire is deployed', () => {
            mock_fetch_requests(mock_server_responses);

        });

        and('a TO Start date has been specified', () => {

        });

        when('I select the questionnaire', () => {

        });

        then('I can view the TO Start Date that was specified', () => {

        });
    });
});
