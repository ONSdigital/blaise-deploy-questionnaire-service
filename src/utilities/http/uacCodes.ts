// /api/uacs/instrument/:instrumentName


import {requestPromiseJson} from "./requestPromise";

function generateUACCodes(instrumentName: string): Promise<boolean> {
    console.log("Sending request generate UAC codes");
    const url = `/api/uacs/instrument/${instrumentName}`;

    return new Promise((resolve: (object: boolean) => void) => {
        requestPromiseJson("POST", url).then(([status, data]) => {
            console.log(`Response from generate UAC codes: Status ${status}, data ${data}`);
            if (status === 200) {
                resolve(true);
            } else {
                resolve(false);
            }
        }).catch((error: Error) => {
            console.error(`Failed to generate UAC codes, Error ${error}`);
            resolve(false);
        });
    });
}

function getCountOfUACs(instrumentName: string): Promise<string | null> {
    console.log(`Sending request to get UAC code count for ${instrumentName}`);
    const url = `/api/uacs/instrument/${instrumentName}/count`;

    return new Promise((resolve: (object: string | null) => void) => {
        requestPromiseJson("GET", url).then(([status, data]) => {
            console.log(`Response from get UAC code count: Status ${status}, data ${data}`);
            if (status === 200) {
                resolve(data);
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
