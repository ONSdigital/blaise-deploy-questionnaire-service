import { requestPromiseJson, requestPromiseJsonList, requestPromiseNoResponse } from "./requestPromise";
import { Instrument } from "../../../Interfaces";
import { InstrumentSettings } from "blaise-api-node-client";

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

    return requestPromiseNoResponse("DELETE", url).then((status): deleteInstrumentResponse => {
        console.log(`Response from deleteInstrument: Status ${status}`);
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

function activateInstrument(instrumentName: string): Promise<boolean> {
    console.log("Call to activateInstrument");
    const url = `/api/instruments/${instrumentName}/activate`;

    return requestPromiseNoResponse("PATCH", url).then((status): boolean => {
        console.log(`Response from activateInstrument: Status ${status}`);
        return status === 204;
    }).catch((error: Error) => {
        console.error(`Response from activateInstrument: Error ${error}`);
        return false;
    });
}


function deactivateInstrument(instrumentName: string): Promise<boolean> {
    console.log("Call to deactivateInstrument");
    const url = `/api/instruments/${instrumentName}/deactivate`;

    return requestPromiseNoResponse("PATCH", url).then((status): boolean => {
        console.log(`Response from deactivateInstrument: Status ${status}`);
        return status === 204;
    }).catch((error: Error) => {
        console.error(`Response from deactivateInstrument: Error ${error}`);
        return false;
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

function getInstrumentModes(instrumentName: string): Promise<string[]> {
    console.log("Sending request get instrument modes");
    const url = `/api/instruments/${instrumentName}/modes`;

    return requestPromiseJson("GET", url).then(([status, data]): string[] => {
        console.log(`Response from get instrument modes: Status ${status}, data ${data}`);
        if (status === 200) {
            return data;
        } else {
            return [];
        }
    }).catch((error: Error) => {
        console.error(`Failed to get instrument modes, Error ${error}`);
        return [];
    });
}

function getInstrumentSettings(instrumentName: string): Promise<InstrumentSettings[]> {
    console.log("Sending request get instrument settings");
    const url = `/api/instruments/${instrumentName}/settings`;

    return requestPromiseJson("GET", url).then(([status, data]): InstrumentSettings[] => {
        console.log(`Response from get instrument settings: Status ${status}, data ${data}`);
        if (status === 200) {
            return data;
        } else {
            return [];
        }
    }).catch((error: Error) => {
        console.error(`Failed to get instrument settings, Error ${error}`);
        return [];
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
    activateInstrument,
    deactivateInstrument,
    sendInstallRequest,
    getInstrumentModes,
    getInstrumentSettings,
    getInstrumentCaseIds
};
