import { Instrument } from "../../../../Interfaces";

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
    status: "Failed",
    dataRecordCount: 0,
    hasData: false,
    active: false,
    fieldPeriod: "April 2020"
}];

export const opnInstrument: Instrument = {
    name: "OPN2004A",
    serverParkName: "gusty",
    installDate: "2021-01-15T15:26:43.4233454+00:00",
    status: "Active",
    dataRecordCount: 0,
    hasData: false,
    active: false,
    fieldPeriod: "April 2020"
};

export const instrumentWithName = (instrumentName: string): Instrument => {
    return {
        name: instrumentName,
        serverParkName: "gusty",
        installDate: "2021-01-15T15:26:43.4233454+00:00",
        status: "Active",
        dataRecordCount: 0,
        hasData: false,
        active: false,
        fieldPeriod: "April 2020"
    };
};
