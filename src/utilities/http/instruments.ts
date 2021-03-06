import {requestPromiseJson, requestPromiseJsonList} from "./requestPromise";
import {Instrument} from "../../../Interfaces";

type verifyInstrumentExistsResponse = [boolean | null, Instrument | null];
type getInstrumentListResponse = [boolean, Instrument[]];
type deleteInstrumentResponse = [boolean, string];

function checkInstrumentAlreadyExists(instrumentName: string): Promise<verifyInstrumentExistsResponse> {
    console.log(`Call to checkSurveyAlreadyExists(${instrumentName})`);
    const url = `/api/instruments/${instrumentName}`;

    return new Promise((resolve: (object: verifyInstrumentExistsResponse) => void) => {
        requestPromiseJson("GET", url).then(([status, data]) => {
            console.log(`Response from check exists: Status ${status}, data ${data}`);
            if (status === 200) {
                if (data.name === instrumentName) {
                    console.log(`${instrumentName} already installed`);
                    resolve([true, data]);
                } else {
                    console.log(`${instrumentName} not found`);
                    resolve([false, null]);
                }
            } else if (status === 404) {
                resolve([false, null]);
            } else {
                resolve([null, null]);
            }
        }).catch((error: Error) => {
            console.error(`Response from check bucket Failed: Error ${error}`);
            resolve([null, null]);
        });
    });
}

function getAllInstruments(): Promise<getInstrumentListResponse> {
    console.log("Call to getAllInstruments");
    const url = "/api/instruments";

    return new Promise((resolve: (object: getInstrumentListResponse) => void) => {
        requestPromiseJsonList("GET", url).then(([success, data]) => {
            console.log(`Response from get all instruments ${(success ? "successful" : "failed")}, data list length ${data.length}`);
            resolve([success, data]);
        }).catch((error: Error) => {
            console.error(`Response from get all instruments Failed: Error ${error}`);
            resolve([false, []]);
        });
    });
}

function deleteInstrument(instrumentName: string): Promise<deleteInstrumentResponse> {
    console.log("Call to deleteInstrument");
    const url = `/api/instruments/${instrumentName}`;

    return new Promise((resolve: (object: deleteInstrumentResponse) => void) => {
        requestPromiseJson("DELETE", url).then(([status, data]) => {
            console.log(`Response from deleteInstrument: Status ${status}, data ${data}`);
            if (status === 204) {
                resolve([true, ""]);
            } else {
                resolve([false, ""]);
            }
        }).catch((error: Error) => {
            console.error(`Response from deleteInstrument: Error ${error}`);
            resolve([false, ""]);
        });
    });
}

function sendInstallRequest(filename: string): Promise<boolean> {
    console.log("Sending request to start install");
    const url = `/api/install?filename=${filename}`;

    return new Promise((resolve: (object: boolean) => void) => {
        requestPromiseJson("GET", url).then(([status, data]) => {
            console.log(`Response from install instrument: Status ${status}, data ${data}`);
            if (status === 201) {
                resolve(true);
            } else {
                resolve(false);
            }
        }).catch((error: Error) => {
            console.error(`Failed to install questionnaire, Error ${error}`);
            resolve(false);
        });
    });
}


export {checkInstrumentAlreadyExists, getAllInstruments, deleteInstrument, sendInstallRequest};
