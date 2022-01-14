import { generateUACCodes, getInstrumentCaseIds, getUACCodesByCaseID, } from "../http";
import { Datas } from "react-csv-downloader/dist/esm/lib/csv";
import { InstrumentUacDetails } from "bus-api-node-client";

function mapCasesToUACCodes(caseIDs: string[], uacCodes: InstrumentUacDetails): Datas {
    if (caseIDs.length === 0 || Object.keys(uacCodes).length === 0) {
        throw new Error("No case IDs or UAC codes provided");
    }

    const array: Datas = [];
    caseIDs.forEach((caseID) => {
        const foundCase = uacCodes[caseID];
        if (foundCase === undefined) {
            return;
        }
        const uacInfo: { [key: string]: string | null | undefined } = {
            serial_number: caseID,
            UAC1: foundCase.uac_chunks.uac1,
            UAC2: foundCase.uac_chunks.uac2,
            UAC3: foundCase.uac_chunks.uac3,
            UAC: foundCase.full_uac
        };
        if (foundCase.uac_chunks.uac4) {
            uacInfo.UAC4 = foundCase.uac_chunks.uac4;
        }
        array.push(uacInfo);
    });

    if (caseIDs.length !== array.length) {
        throw new Error(`Number of cases (${caseIDs.length}) does not match number of UAC Codes (${array.length})`);
    }

    return array;
}

async function generateUACCodesAndCSVFileData(instrumentName: string): Promise<Datas> {
    const generatedUACCodes = await generateUACCodes(instrumentName);
    if (!generatedUACCodes) {
        throw new Error("Failed to generate UAC codes");
    }

    const uacCodes = await getUACCodesByCaseID(instrumentName);
    if (uacCodes === undefined) {
        throw new Error("Failed to get UAC codes by case ID");
    }

    const [getInstrumentCaseIdsSuccess, caseIDs] = await getInstrumentCaseIds(instrumentName);
    if (!getInstrumentCaseIdsSuccess) {
        throw new Error("Failed to get instrument case IDs");
    }

    return mapCasesToUACCodes(caseIDs, uacCodes);
}

export { generateUACCodesAndCSVFileData, mapCasesToUACCodes };
