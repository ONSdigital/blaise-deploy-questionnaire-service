import {Instrument, Survey} from "../../../Interfaces";

export const survey_list: Survey[] = [
    {
        survey: "OPN",
        instruments: [
            {
                activeToday: true,
                fieldPeriod: "July 2020",
                expired: false,
                installDate: "2020-12-11T11:53:55.5612856+00:00",
                link: "https://external-web-url/OPN2007T?LayoutSet=CATI-Interviewer_Large",
                name: "OPN2007T",
                serverParkName: "LocalDevelopment",
                surveyTLA: "OPN",
                surveyDays: []
            }
        ]
    },
    {
        survey: "LMS",
        instruments: [
            {
                activeToday: true,
                fieldPeriod: "Unknown",
                expired: false,
                installDate: "2020-12-11T11:53:55.5612856+00:00",
                link: "https://external-web-url/LMSSurvey01?LayoutSet=CATI-Interviewer_Large",
                name: "LMSSurvey01",
                serverParkName: "LocalDevelopment",
                surveyTLA: "LMS",
                surveyDays: []
            }
        ]
    }
];
export const instrumentList: Instrument[] = [{
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
    name: "OPN2004A",
    serverParkName: "gusty",
    installDate: "2021-01-15T15:26:43.4233454+00:00",
    status: "Active",
    dataRecordCount: 0,
    hasData: false,
    active: false,
    fieldPeriod: "April 2020"
}];

