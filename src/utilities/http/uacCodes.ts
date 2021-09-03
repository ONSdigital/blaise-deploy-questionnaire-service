import {requestPromiseJson} from "./requestPromise";
import {InstrumentUacDetails} from "../../../server/BusAPI/interfaces/instrument-uac-details";
import {Datas} from "react-csv-downloader/dist/esm/lib/csv";

function mapUACsToCSVFile(uacList: InstrumentUacDetails | null): Datas {
    const array: Datas = [];
    if (uacList === null) {
        return [];
    }

    Object.entries(uacList).forEach(([, value]) => {
        array.push({
            case_id: value.case_id,
            UAC1: value.uac_chunks.uac1,
            UAC2: value.uac_chunks.uac2,
            UAC3: value.uac_chunks.uac3
        });
    });

    return array;
}

function generateUACCodesAndCSVFile(instrumentName: string): Promise<Datas> {
    console.log("Sending request generate UAC codes");
    const url = `/api/uacs/instrument/${instrumentName}`;

    return requestPromiseJson("POST", url)
        .then(([status, data]) => {
            console.log(`Response from generate UAC codes: Status ${status}, data ${data}`);
            return mapUACsToCSVFile(data);
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


export {generateUACCodesAndCSVFile, getCountOfUACs, mapUACsToCSVFile};
