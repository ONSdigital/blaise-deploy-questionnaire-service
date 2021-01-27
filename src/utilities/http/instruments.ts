import {requestPromiseJson} from "./requestPromise";
import {Instrument} from "../../../Interfaces";

type verifyInstrumentExistsResponse = [boolean | null, Instrument | null];

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

export {checkInstrumentAlreadyExists};
