import {requestPromiseJson} from "./requestPromise";

function setTOStartDate(instrumentName: string, toStartDate: string | undefined): Promise<boolean> {
    console.log(`Call to setTOStartDate(${instrumentName}, ${toStartDate})`);
    const url = `/api/tostartdate/${instrumentName}`;
    const data = {"tostartdate": toStartDate};

    return requestPromiseJson("POST", url, data).then(([status, data]): boolean => {
        console.log(`Response from set TO start date: Status ${status}, data ${data}`);
        return status === 200 || status === 201;
    }).catch((error: Error) => {
        console.error(`Response from set start date Failed: Error ${error}`);
        return false;
    });

}

type getTOStartDateResponse = [boolean | null, string]

function getTOStartDate(instrumentName: string): Promise<getTOStartDateResponse> {
    console.log(`Call to getTOStartDate(${instrumentName})`);
    const url = `/api/tostartdate/${instrumentName}`;

    return requestPromiseJson("GET", url).then(([status, data]): getTOStartDateResponse => {
        console.log(`Response from set TO start date: Status ${status}, data ${data}`);
        if (status === 200) {
            if (data.tostartdate !== undefined) {
                return [true, data.tostartdate];
            } else {
                return [null, ""];
            }
        } else if (status === 404) {
            return [false, ""];
        } else {
            return [null, ""];
        }
    }).catch((error: Error) => {
        console.error(`Response from set start date Failed: Error ${error}`);
        return [null, ""];
    });

}


function deleteTOStartDate(instrumentName: string): Promise<boolean> {
    console.log(`Call to deleteTOStartDate(${instrumentName})`);
    const url = `/api/tostartdate/${instrumentName}`;

    return requestPromiseJson("DELETE", url).then(([status, data]): boolean => {
        console.log(`Response from delete TO start date: Status ${status}, data ${data}`);
        return status === 204;
    }).catch((error: Error) => {
        console.error(`Response from delete TO start date Failed: Error ${error}`);
        return false;
    });
}

export {setTOStartDate, getTOStartDate, deleteTOStartDate};
