import {requestPromiseJson} from "./requestPromise";

type verifyAndInstallResponse = [boolean, string];


async function verifyAndInstallInstrument(filename: string): Promise<verifyAndInstallResponse> {
    const fileFound = await checkFileInBucket(filename);
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


function checkFileInBucket(filename: string): Promise<boolean> {
    console.log(`Call to checkFileInBucket(${filename})`);
    const url = `/bucket?filename=${filename}`;

    return new Promise((resolve: (object: boolean) => void) => {
        requestPromiseJson("GET", url).then(([status, data]) => {
            console.log(`Response from check bucket: Status ${status}, data ${data}`);
            if (status === 200) {
                if (data.name === filename) {
                    resolve(true);
                } else {
                    console.log(`Filename returned (${data.name}) does not match sent file`);
                    resolve(false);
                }
            } else {
                resolve(false);
            }
        }).catch((error: Error) => {
            console.error(`Response from check bucket Failed: Error ${error}`);
            resolve(false);
        });
    });
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

export {verifyAndInstallInstrument};
