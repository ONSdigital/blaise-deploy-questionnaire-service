import {deleteInstrument} from "./instruments";
import {deleteTOStartDate} from "./toStartDate";

type removeToStartDateAndDeleteInstrumentResponse = [boolean, string];


async function removeToStartDateAndDeleteInstrument(instrumentName: string): Promise<removeToStartDateAndDeleteInstrumentResponse> {

    const toStartDateDeleted = await deleteTOStartDate(instrumentName);
    if (!toStartDateDeleted) {
        console.error("Failed to delete TO start data");
        return Promise.resolve([false, "Failed to delete TO start data"]);
    }


    const [deleted] = await deleteInstrument(instrumentName);
    if (!deleted) {
        console.error("Failed to delete the questionnaire");
        return Promise.resolve([false, "Failed to delete the questionnaire"]);
    }

    return Promise.resolve([true, "Installed successfully"]);
}

export {removeToStartDateAndDeleteInstrument};
