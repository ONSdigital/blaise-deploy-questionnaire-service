import {deleteTOStartDate} from "../toStartDate";
import {deleteTMReleaseDate} from "../tmReleaseDate";
import {deleteQuestionnaire} from "../questionnaires";

type removeToStartDateAndDeleteQuestionnaireResponse = [boolean, string];


async function removeToStartDateAndDeleteQuestionnaire(questionnaireName: string): Promise<removeToStartDateAndDeleteQuestionnaireResponse> {
    const toStartDateDeleted = await deleteTOStartDate(questionnaireName);
    if (!toStartDateDeleted) {
        console.error("Failed to delete TO start date");
        return [false, "Failed to delete TO start date"];
    }

    const tmReleaseDateDeleted = await deleteTMReleaseDate(questionnaireName);
    if (!toStartDateDeleted) {
        console.error("Failed to delete Totalmobile release date");
        return [false, "Failed to delete Totalmobile release date"];
    }
    const deleted = await deleteQuestionnaire(questionnaireName);
    if (!deleted) {
        console.error("Failed to delete the questionnaire");
        return [false, "Failed to delete the questionnaire"];
    }

    return [true, "Deleted successfully"];
}

export {removeToStartDateAndDeleteQuestionnaire};
