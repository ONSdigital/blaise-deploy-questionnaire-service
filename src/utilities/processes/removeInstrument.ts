import { deleteTOStartDate } from "../../client/toStartDate";
import { deleteInstrument } from "../../client/instruments";

type removeToStartDateAndDeleteInstrumentResponse = [boolean, string];


async function removeToStartDateAndDeleteInstrument(instrumentName: string): Promise<removeToStartDateAndDeleteInstrumentResponse> {
    const toStartDateDeleted = await deleteTOStartDate(instrumentName);
    if (!toStartDateDeleted) {
        console.error("Failed to delete TO start date");
        return Promise.resolve([false, "Failed to delete TO start date"]);
    }

    const deleted = await deleteInstrument(instrumentName);
    if (!deleted) {
        console.error("Failed to delete the questionnaire");
        return Promise.resolve([false, "Failed to delete the questionnaire"]);
    }

    return Promise.resolve([true, "Deleted successfully"]);
}

export { removeToStartDateAndDeleteInstrument };
