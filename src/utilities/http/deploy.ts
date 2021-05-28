import {requestPromiseJson} from "./requestPromise";
import {validateUploadIsComplete} from "./upload";

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


function sendInstallRequest(filename: string): Promise<boolean> {
    console.log("Sending request to start install");
    const url = `/api/install?filename=${filename}`;

    return new Promise((resolve: (object: boolean) => void) => {
        requestPromiseJson("GET", url).then(([status, data]) => {
            console.log(`Response from install instrument: Status ${status}, data ${data}`);
            if (status === 201) {
                resolve(true);
            } else {
                resolve(false);
            }
        }).catch((error: Error) => {
            console.error(`Failed to install questionnaire, Error ${error}`);
            resolve(false);
        });
    });
}

export {sendInstallRequest, verifyAndInstallInstrument};
