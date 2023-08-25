import { Questionnaire } from "blaise-api-node-client";

export const questionnaireListMockObject = [{
    name: "OPN2101A",
    serverParkName: "gusty",
    installDate: "2021-01-15T14:41:29.4399898+00:00",
    status: "Active",
    dataRecordCount: 0,
    hasData: false,
}, {
    name: "OPN2007T",
    serverParkName: "gusty",
    installDate: "2021-01-15T15:18:40.1503617+00:00",
    status: "Installing",
    dataRecordCount: 10,
    hasData: true,
}, {
    name: "LMS2101_AA1",
    serverParkName: "gusty",
    installDate: "2021-01-15T15:26:43.4233454+00:00",
    status: "Erroneous",
    dataRecordCount: 0,
    hasData: false,
}];

export const questionnaireMockObject = {
    name: "OPN2101A",
    serverParkName: "gusty",
    installDate: "2021-01-15T14:41:29.4399898+00:00",
    status: "Active",
    dataRecordCount: 0,
    hasData: false,
};

export const expectedQuestionnaireList: Questionnaire[] = [{
    name: "OPN2101A",
    serverParkName: "gusty",
    installDate: "2021-01-15T14:41:29.4399898+00:00",
    status: "Active",
    dataRecordCount: 0,
    hasData: false,
    fieldPeriod: "January 2021"
}, {
    name: "OPN2007T",
    serverParkName: "gusty",
    installDate: "2021-01-15T15:18:40.1503617+00:00",
    status: "Installing",
    dataRecordCount: 10,
    hasData: true,
    fieldPeriod: "July 2020"
}, {
    name: "LMS2101_AA1",
    serverParkName: "gusty",
    installDate: "2021-01-15T15:26:43.4233454+00:00",
    status: "Failed",
    dataRecordCount: 0,
    hasData: false,
    fieldPeriod: "January 2021"
}];
