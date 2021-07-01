import {requestPromiseJson} from "./requestPromise";

function setTOStartDate(instrumentName: string, liveDate: string): Promise<boolean> {
    console.log(`Call to setTOStartDate(${instrumentName}, ${liveDate})`);
    const url = `/api/livedate/${instrumentName}`;
    const data = {"livedate": liveDate};

    return new Promise((resolve: (object: boolean) => void) => {
        requestPromiseJson("POST", url, data).then(([status, data]) => {
            console.log(`Response from set TO start date: Status ${status}, data ${data}`);
            if (status === 201) {
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

export {setTOStartDate};
