import {requestPromiseJson} from "./requestPromise";
import axios from "axios";

type initialiseUploadResponse = [boolean, string];

function initialiseUpload(filename: string): Promise<initialiseUploadResponse> {
    console.log(`Call to initialiseUpload(${filename})`);
    const url = `/upload/init?filename=${filename}`;

    return new Promise((resolve: (object: initialiseUploadResponse) => void) => {
        requestPromiseJson("GET", url).then(([status, data]) => {
            console.log(`Response from initialise Upload: Status ${status}, data ${data}`);
            if (status === 200) {
                // Validate the url is a valid url for storage.googleapis.com
                const signedUrlHost = new URL(data).host;
                const allowedHosts = [
                    "storage.googleapis.com"
                ];

                if (!allowedHosts.includes(signedUrlHost)) {
                    resolve([false, ""]);
                }

                resolve([true, data]);
            } else {
                resolve([false, ""]);
            }
        }).catch((error: Error) => {
            console.error(`Response from initialise Upload: Error ${error}`);
            resolve([false, ""]);
        });
    });
}

function validateUploadIsComplete(filename: string): Promise<boolean> {
    console.log(`Call to validateUploadIsComplete(${filename})`);
    const url = `/upload/verify?filename=${filename}`;

    return new Promise((resolve: (object: boolean) => void) => {
        requestPromiseJson("GET", url).then(([status, data]) => {
            console.log(`Response from check bucket: Status ${status}, data ${data}`);
            if (status === 200) {
                if (data.name === filename) {
                    resolve(true);
                } else {
                    console.log(`Filename returned (${data.name}) does not match sent file (${filename})`);
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

function uploadFile(url: string, file: File, onFileUploadProgress: (event: ProgressEvent) => void): Promise<boolean> {
    const config = {
        onUploadProgress: (progressEvent: ProgressEvent) => onFileUploadProgress(progressEvent),
        headers: {
            "Content-Type": "application/octet-stream",
        }
    };

    console.log("Uploading to bucket");
    return new Promise((resolve: (object: boolean) => void) => {
        axios.put(url, file, config)
            .then(function () {
                console.log("File successfully uploaded");
                resolve(true);
            })
            .catch(function (error) {
                console.error(`File failed to upload ${error}`);
                resolve(false);
            });
    });
}

export {validateUploadIsComplete, initialiseUpload, uploadFile};
