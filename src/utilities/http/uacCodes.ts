import {requestPromiseJson} from "./requestPromise";
import {InstrumentUacDetails} from "../../../server/BusAPI/interfaces/instrument-uac-details";


function generateUACCodes(instrumentName: string): Promise<boolean> {
    console.log("Sending request generate UAC codes");
    const url = `/api/uacs/instrument/${instrumentName}`;

    return requestPromiseJson("POST", url)
        .then(([status, data]) => {
            console.log(`Response from generate UAC codes: Status ${status}, data ${data}`);
            return status === 200;
        });
}

function getCountOfUACs(instrumentName: string): Promise<number | null> {
    console.log(`Sending request to get UAC code count for ${instrumentName}`);
    const url = `/api/uacs/instrument/${instrumentName}/count`;

    return requestPromiseJson("GET", url).then(([status, data]): number | null => {
        console.log(`Response from get UAC code count: Status ${status}, data ${data}`);
        if (status === 200 && typeof data.count === "number") {
            return data.count;
        } else {
            return null;
        }
    }).catch((error: Error) => {
        console.error(`Failed to get UAC code count, Error ${error}`);
        return null;
    });
}


function getUACCodesByCaseID(instrumentName: string): Promise<InstrumentUacDetails | undefined> {
    console.log(`Sending request to get UAC codes by case ID ${instrumentName}`);
    const url = `/api/uacs/instrument/${instrumentName}/bycaseid`;

    return requestPromiseJson("GET", url).then(([status, data]): InstrumentUacDetails | undefined => {
        console.log(`Response from get UAC codes by case ID: Status ${status}, data ${data}`);
        if (status === 200) {
            return data;
        } else {
            return undefined;
        }
    }).catch((error: Error) => {
        console.error(`Failed to get UAC codes by case ID, Error ${error}`);
        return undefined;
    });
}


export {generateUACCodes, getCountOfUACs, getUACCodesByCaseID};
