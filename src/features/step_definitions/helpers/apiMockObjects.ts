import { AxiosError, AxiosHeaders } from "axios";
import { Questionnaire } from "blaise-api-node-client";

export const questionnaireList: Questionnaire[] = [{
    name: "OPN2101A",
    serverParkName: "gusty",
    installDate: "2021-01-15T14:41:29.4399898+00:00",
    status: "Active",
    dataRecordCount: 0,
    hasData: false,
    active: false,
    fieldPeriod: "January 2021",
    blaiseVersion: "5.9.9.2735"
}, {
    name: "OPN2007T",
    serverParkName: "gusty",
    installDate: "2021-01-15T15:18:40.1503617+00:00",
    status: "Active",
    dataRecordCount: 10,
    hasData: true,
    active: true,
    fieldPeriod: "July 2020",
    blaiseVersion: "5.9.9.2735"

}, {
    name: "OPN2004A",
    serverParkName: "gusty",
    installDate: "2021-01-15T15:26:43.4233454+00:00",
    status: "Failed",
    dataRecordCount: 0,
    hasData: false,
    active: false,
    fieldPeriod: "April 2020",
    blaiseVersion: "5.9.9.2735"

}];

export const opnQuestionnaire: Questionnaire = {
    name: "OPN2004A",
    serverParkName: "gusty",
    installDate: "2021-01-15T15:26:43.4233454+00:00",
    status: "Active",
    dataRecordCount: 0,
    hasData: false,
    active: false,
    fieldPeriod: "April 2020",
    blaiseVersion: "5.9.9.2735"
};

export const ipsQuestionnaire: Questionnaire = {
    name: "IPS1337a",
    serverParkName: "gusty",
    installDate: "2021-01-15T15:26:43.4233454+00:00"
};

export const ipsPilotQuestionnaire: Questionnaire = {
    name: "IPS2500a",
    serverParkName: "gusty",
    installDate: "2022-01-15T15:26:43.4233454+00:00"
};

export const questionnaireWithName = (questionnaireName: string): Questionnaire => {
    return {
        name: questionnaireName,
        serverParkName: "gusty",
        installDate: "2021-01-15T15:26:43.4233454+00:00",
        status: "Active",
        dataRecordCount: 0,
        hasData: false,
        active: false,
        fieldPeriod: "April 2020",
        blaiseVersion: "5.9.9.2735"
    };
};

export const cloudFunctionAxiosError: AxiosError = new AxiosError();
cloudFunctionAxiosError.response = {
    status: 500,
    statusText: "Internal Server Error",
    data: "Error creating IPS donor cases: No users found with role 'IPS Manager'",
    headers: {},
    config: {
        headers: new AxiosHeaders(),
    },
};

export const mockSuccessResponseForDonorCasesCreation = {
    data: "Success",
    status: 200,
};