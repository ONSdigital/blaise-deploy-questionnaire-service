import { type Datas } from "react-csv-downloader/dist/esm/lib/csv";

import { generateUacs, getUacsByCaseId } from "../../client/uacs";
import { getQuestionnaireCaseIds } from "../questionnaires";
import { type InstrumentUacDetails } from "../types/uacDetails";

export function mapCasesToUacs(caseIDs: string[], uacs: InstrumentUacDetails): Datas {
  if (caseIDs.length === 0 || Object.keys(uacs).length === 0) {
    throw new Error("No case IDs or UACs provided");
  }

  const array: Datas = [];

  caseIDs.forEach((caseID) => {
    const foundCase = uacs[caseID];

    if (foundCase === undefined) {
      return;
    }

    const uacInfo: { [key: string]: string | null | undefined } = {
      serial_number: caseID,
      UAC1: foundCase.uac_chunks.uac1,
      UAC2: foundCase.uac_chunks.uac2,
      UAC3: foundCase.uac_chunks.uac3,
      UAC: foundCase.full_uac,
    };

    if (foundCase.uac_chunks.uac4) {
      uacInfo.UAC4 = foundCase.uac_chunks.uac4;
    }

    array.push(uacInfo);
  });

  if (caseIDs.length !== array.length) {
    throw new Error(
      `Number of cases (${caseIDs.length}) does not match number of UACs (${array.length})`,
    );
  }

  return array;
}

export async function generateUacsAndCsvFileData(questionnaireName: string): Promise<Datas> {
  const generatedUacs = await generateUacs(questionnaireName);

  if (!generatedUacs) {
    throw new Error("Failed to generate UACs");
  }

  const uacs = await getUacsByCaseId(questionnaireName);

  if (uacs === undefined) {
    throw new Error("Failed to get UACs by case ID");
  }

  const caseIDs = await getQuestionnaireCaseIds(questionnaireName);

  return mapCasesToUacs(caseIDs, uacs);
}
