import {sendInstallRequest, validateUploadIsComplete} from "../http";

type verifyAndInstallResponse = [boolean, string];


async function verifyAndInstallInstrument(filename: string): Promise<verifyAndInstallResponse> {
    const fileFound = await validateUploadIsComplete(filename);
    if (!fileFound) {
        console.error("Failed to validate if file has been uploaded");
        return Promise.resolve([false, "Failed to validate if file has been uploaded successfully"]);
    }

    const installSuccess = await sendInstallRequest(filename);

    if (!installSuccess) {
        console.error("Failed to install the questionnaire");
        return Promise.resolve([false, "Failed to install the questionnaire"]);
    }

    return Promise.resolve([true, "Installed successfully"]);

}

export {verifyAndInstallInstrument};
