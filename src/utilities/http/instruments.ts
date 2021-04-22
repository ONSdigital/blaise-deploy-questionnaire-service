import {requestPromiseJson} from "./requestPromise";
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
    let list: Instrument[] = [];
    console.log("Call to getAllInstruments");
    const url = "/api/instruments";

    return new Promise((resolve: (object: getInstrumentListResponse) => void) => {
        requestPromiseJson("GET", url).then(([status, data]) => {
            console.log(`Response from get all instruments: Status ${status}, data ${data}`);
            if (status === 200) {
                if (!Array.isArray(data)) {
                    resolve([false, list]);
                }
                list = data;
                resolve([true, list]);
            } else if (status === 404) {
                resolve([true, list]);
            } else {
                resolve([false, list]);
            }
        }).catch((error: Error) => {
            console.error(`Response from get all instruments Failed: Error ${error}`);
            resolve([false, list]);
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

export {checkInstrumentAlreadyExists, getAllInstruments, deleteInstrument};
