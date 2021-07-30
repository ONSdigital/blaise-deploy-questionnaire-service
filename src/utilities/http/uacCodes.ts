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

export {generateUACCodes};
