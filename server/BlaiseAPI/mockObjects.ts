import {Instrument} from "../../Interfaces";

export const healthCheckFromAPI = [
    {"health check type": "Connection model", status: "OK"},
    {"health check type": "Blaise connection", status: "OK"},
    {"health check type": "Remote data server connection", status: "OK"},
    {"health check type": "Remote Cati management connection", status: "OK"}
];

export const instrumentFromAPI = {
    "surveyDays": [
        "2020-09-25T00:00:00",
        "2020-09-26T00:00:00",
        "2020-09-27T00:00:00",
        "2020-09-28T00:00:00",
        "2020-09-29T00:00:00",
        "2020-09-30T00:00:00"
    ],
        "active": false,
        "activeToday": false,
        "deliverData": false,
        "name": "OPN2101A",
        "serverParkName": "gusty",
        "installDate": "2021-04-26T09:21:14.5246862+01:00",
        "status": "Active",
        "dataRecordCount": 0,
        "hasData": false
};

export const instrumentListFromAPI = [{
    name: "OPN2101A",
    serverParkName: "gusty",
    installDate: "2021-01-15T14:41:29.4399898+00:00",
    status: "Active",
    dataRecordCount: 0,
    hasData: false,
    active: false,
}, {
    name: "OPN2007T",
    serverParkName: "gusty",
    installDate: "2021-01-15T15:18:40.1503617+00:00",
    status: "Active",
    dataRecordCount: 10,
    hasData: true,
    active: true,
}, {
    name: "LMS2101_AA1",
    serverParkName: "gusty",
    installDate: "2021-01-15T15:26:43.4233454+00:00",
    status: "Active",
    dataRecordCount: 0,
    hasData: false,
    active: false,
}];

export const expectedInstrumentList: Instrument[] = [{
    name: "OPN2101A",
    serverParkName: "gusty",
    installDate: "2021-01-15T14:41:29.4399898+00:00",
    status: "Active",
    dataRecordCount: 0,
    hasData: false,
    active: false,
    fieldPeriod: "January 2021"
}, {
    name: "OPN2007T",
    serverParkName: "gusty",
    installDate: "2021-01-15T15:18:40.1503617+00:00",
    status: "Active",
    dataRecordCount: 10,
    hasData: true,
    active: true,
    fieldPeriod: "July 2020"
}, {
    name: "LMS2101_AA1",
    serverParkName: "gusty",
    installDate: "2021-01-15T15:26:43.4233454+00:00",
    status: "Active",
    dataRecordCount: 0,
    hasData: false,
    active: false,
    fieldPeriod: "Field period unknown"
}];
