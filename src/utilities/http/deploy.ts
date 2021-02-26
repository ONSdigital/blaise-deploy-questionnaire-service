import {requestPromiseJson} from "./requestPromise";



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

export {sendInstallRequest};
