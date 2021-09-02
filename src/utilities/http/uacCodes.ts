// /api/uacs/instrument/:instrumentName


import {requestPromiseJson} from "./requestPromise";
import {InstrumentUacDetails} from "../../../server/BusAPI/interfaces/instrument-uac-details";

type generateUACResponse = [boolean, InstrumentUacDetails | null];

function generateUACCodes(instrumentName: string): Promise<generateUACResponse> {
    console.log("Sending request generate UAC codes");
    const url = `/api/uacs/instrument/${instrumentName}`;

    return new Promise((resolve: (object: generateUACResponse) => void) => {
        requestPromiseJson("POST", url).then(([status, data]) => {
            console.log(`Response from generate UAC codes: Status ${status}, data ${data}`);
            if (status === 200) {
                resolve([true, data]);
            } else {
                resolve([false, data]);
            }
        }).catch((error: Error) => {
            console.error(`Failed to generate UAC codes, Error ${error}`);
            resolve([false, null]);
        });
    });
}

function getCountOfUACs(instrumentName: string): Promise<number | null> {
    console.log(`Sending request to get UAC code count for ${instrumentName}`);
    const url = `/api/uacs/instrument/${instrumentName}/count`;

    return new Promise((resolve: (object: number | null) => void) => {
        requestPromiseJson("GET", url).then(([status, data]) => {
            console.log(`Response from get UAC code count: Status ${status}, data ${data}`);
            if (status === 200 && typeof data.count === "number") {
                resolve(data.count);
            } else {
                resolve(null);
            }
        }).catch((error: Error) => {
            console.error(`Failed to get UAC code count, Error ${error}`);
            resolve(null);
        });
    });
}


export {generateUACCodes, getCountOfUACs};
