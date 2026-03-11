import { installQuestionnaire } from "../questionnaires";
import { validateUploadIsComplete } from "../upload";
import { clientLogger } from "../../client/logger";

type verifyAndInstallResponse = [boolean, string];

async function verifyAndInstallQuestionnaire(filename: string): Promise<verifyAndInstallResponse> {
    const fileFound = await validateUploadIsComplete(filename);
    if (!fileFound) {
        clientLogger.error("Failed to validate if file has been uploaded");
        return [false, "Failed to validate if file has been uploaded successfully"];
    }

    const installSuccess = await installQuestionnaire(filename);

    if (!installSuccess) {
        clientLogger.error("Failed to install the questionnaire");
        return [false, "Failed to install the questionnaire"];
    }

    return [true, "Installed successfully"];

}

export { verifyAndInstallQuestionnaire };
