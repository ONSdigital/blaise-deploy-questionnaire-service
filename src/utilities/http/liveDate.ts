import {requestPromiseJson} from "./requestPromise";

function setLiveDate(instrumentName: string, liveDate: string): Promise<boolean> {
    console.log(`Call to setLiveDate(${instrumentName}, ${liveDate})`);
    const url = `/api/livedate/${instrumentName}`;
    const data = {"livedate": liveDate};

    return new Promise((resolve: (object: boolean) => void) => {
        requestPromiseJson("POST", url, data).then(([status, data]) => {
            console.log(`Response from set Live Date: Status ${status}, data ${data}`);
            if (status === 201) {
                resolve(true);
            } else {
                resolve(false);
            }
        }).catch((error: Error) => {
            console.error(`Response from set Live Date Failed: Error ${error}`);
            resolve(false);
        });
    });
}

export {setLiveDate};
