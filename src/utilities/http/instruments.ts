import {requestPromiseJson, requestPromiseJsonList} from "./requestPromise";
import {Instrument} from "../../../Interfaces";
import {InstrumentSettings} from "blaise-api-node-client";

type verifyInstrumentExistsResponse = [boolean | null, Instrument | null];
type getInstrumentListResponse = [boolean, Instrument[]];
type deleteInstrumentResponse = [boolean, string];
type getInstrumentCaseIDsResponse = [boolean, string[]];

function checkInstrumentAlreadyExists(instrumentName: string): Promise<verifyInstrumentExistsResponse> {
    console.log(`Call to checkSurveyAlreadyExists(${instrumentName})`);
    const url = `/api/instruments/${instrumentName}`;

    return requestPromiseJson("GET", url).then(([status, data]): verifyInstrumentExistsResponse => {
        console.log(`Response from check exists: Status ${status}, data ${data}`);
        if (status === 200) {
            if (data.name === instrumentName) {
                console.log(`${instrumentName} already installed`);
                return [true, data];
            } else {
                console.log(`${instrumentName} not found`);
                return [false, null];
            }
        } else if (status === 404) {
            return [false, null];
        } else {
            return [null, null];
        }
    }).catch((error: Error) => {
        console.error(`Response from check bucket Failed: Error ${error}`);
        return [null, null];
    });
}

function getAllInstruments(): Promise<getInstrumentListResponse> {
    console.log("Call to getAllInstruments");
    const url = "/api/instruments";

    return requestPromiseJsonList("GET", url).then((response) => {
        return response;
    });
}

function deleteInstrument(instrumentName: string): Promise<deleteInstrumentResponse> {
    console.log("Call to deleteInstrument");
    const url = `/api/instruments/${instrumentName}`;

    return requestPromiseJson("DELETE", url).then(([status, data]): deleteInstrumentResponse => {
        console.log(`Response from deleteInstrument: Status ${status}, data ${data}`);
        if (status === 204) {
            return [true, ""];
        } else {
            return [false, ""];
        }
    }).catch((error: Error) => {
        console.error(`Response from deleteInstrument: Error ${error}`);
        return [false, ""];
    });
}

function sendInstallRequest(filename: string): Promise<boolean> {
    console.log("Sending request to start install");
    const url = `/api/install?filename=${filename}`;

    return requestPromiseJson("GET", url).then(([status, data]): boolean => {
        console.log(`Response from install instrument: Status ${status}, data ${data}`);
        return status === 201;
    }).catch((error: Error) => {
        console.error(`Failed to install questionnaire, Error ${error}`);
        return false;
    });
}

function doesInstrumentHaveCAWIMode(instrumentName: string): Promise<boolean | null> {
    console.log("Sending request does instrument have cawi mode");
    const url = `/api/instruments/${instrumentName}/modes/CAWI`;

    return requestPromiseJson("GET", url).then(([status, data]): boolean | null => {
        console.log(`Response from does instrument have cawi mode: Status ${status}, data ${data}`);
        if (status === 200) {
            return data === true;
        } else {
            return null;
        }
    }).catch((error: Error) => {
        console.error(`Failed to does instrument have cawi mode, Error ${error}`);
        return null;
    });
}

function getInstrumentModes(instrumentName: string): Promise<string[] | null> {
    console.log("Sending request get instrument modes");
    const url = `/api/instruments/${instrumentName}/modes`;

    return requestPromiseJson("GET", url).then(([status, data]): string[] | null => {
        console.log(`Response from get instrument modes: Status ${status}, data ${data}`);
        if (status === 200) {
            return data;
        } else {
            return null;
        }
    }).catch((error: Error) => {
        console.error(`Failed to get instrument modes, Error ${error}`);
        return null;
    });
}

function getInstrumentSettings(instrumentName: string): Promise<InstrumentSettings[] | null> {
    console.log("Sending request get instrument settings");
    const url = `/api/instruments/${instrumentName}/settings`;

    return requestPromiseJson("GET", url).then(([status, data]): InstrumentSettings[] | null => {
        console.log(`Response from get instrument settings: Status ${status}, data ${data}`);
        if (status === 200) {
            return data;
        } else {
            return null;
        }
    }).catch((error: Error) => {
        console.error(`Failed to get instrument settings, Error ${error}`);
        return null;
    });
}

function getInstrumentCaseIds(instrumentName: string): Promise<getInstrumentCaseIDsResponse> {
    console.log("Call to getAllInstruments");
    const url = `/api/instruments/${instrumentName}/cases/ids`;

    return requestPromiseJsonList("GET", url).then((response) => {
        return response;
    });
}

export {
    checkInstrumentAlreadyExists,
    getAllInstruments,
    deleteInstrument,
    sendInstallRequest,
    doesInstrumentHaveCAWIMode,
    getInstrumentModes,
    getInstrumentSettings,
    getInstrumentCaseIds
};
