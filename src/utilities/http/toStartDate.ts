import {requestPromiseJson} from "./requestPromise";

function setTOStartDate(instrumentName: string, toStartDate: string | undefined): Promise<boolean> {
    console.log(`Call to setTOStartDate(${instrumentName}, ${toStartDate})`);
    const url = `/api/tostartdate/${instrumentName}`;
    const data = {"tostartdate": toStartDate};

    return new Promise((resolve: (object: boolean) => void) => {
        requestPromiseJson("POST", url, data).then(([status, data]) => {
            console.log(`Response from set TO start date: Status ${status}, data ${data}`);
            if (status === 200 || status === 201) {
                resolve(true);
            } else {
                resolve(false);
            }
        }).catch((error: Error) => {
            console.error(`Response from set start date Failed: Error ${error}`);
            resolve(false);
        });
    });
}

function deleteTOStartDate(instrumentName: string): Promise<boolean> {
    console.log(`Call to deleteTOStartDate(${instrumentName})`);
    const url = `/api/tostartdate/${instrumentName}`;

    return new Promise((resolve: (object: boolean) => void) => {
        requestPromiseJson("DELETE", url).then(([status, data]) => {
            console.log(`Response from delete TO start date: Status ${status}, data ${data}`);
            if (status === 204) {
                resolve(true);
            } else {
                resolve(false);
            }
        }).catch((error: Error) => {
            console.error(`Response from delete TO start date Failed: Error ${error}`);
            resolve(false);
        });
    });
}

export {setTOStartDate, deleteTOStartDate};
