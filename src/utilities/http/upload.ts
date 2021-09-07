import {requestPromiseJson, requestPromiseJsonList} from "./requestPromise";
import axios from "axios";

type initialiseUploadResponse = [boolean, string];

function initialiseUpload(filename: string): Promise<initialiseUploadResponse> {
    console.log(`Call to initialiseUpload(${filename})`);
    const url = `/upload/init?filename=${filename}`;

    return requestPromiseJson("GET", url).then(([status, data]): initialiseUploadResponse => {
        console.log(`Response from initialise Upload: Status ${status}, data ${data}`);
        if (status === 200) {
            // Validate the url is a valid url for storage.googleapis.com
            const signedUrlHost = new URL(data).host;
            const allowedHosts = [
                "storage.googleapis.com"
            ];

            if (!allowedHosts.includes(signedUrlHost)) {
                return [false, ""];
            }
            return [true, data];
        } else {
            return [false, ""];
        }
    }).catch((error: Error) => {
        console.error(`Response from initialise Upload: Error ${error}`);
        return [false, ""];
    });

}

function validateUploadIsComplete(filename: string): Promise<boolean> {
    console.log(`Call to validateUploadIsComplete(${filename})`);
    const url = `/upload/verify?filename=${filename}`;

    return requestPromiseJson("GET", url).then(([status, data]): boolean => {
        console.log(`Response from check bucket: Status ${status}, data ${data}`);
        if (status === 200) {
            if (data.name === filename) {
                return true;
            } else {
                console.log(`Filename returned (${data.name}) does not match sent file (${filename})`);
                return false;
            }
        } else {
            return false;
        }
    }).catch((error: Error) => {
        console.error(`Response from check bucket Failed: Error ${error}`);
        return false;
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

type allInstrumentsInBucketResponse = [boolean, string[]];

function getAllInstrumentsInBucket(): Promise<allInstrumentsInBucketResponse> {
    console.log("Call to getAllInstruments");
    const url = "/bucket/files";

    return requestPromiseJsonList("GET", url).then((response) => {
        return response;
    });
}

export {validateUploadIsComplete, initialiseUpload, uploadFile, getAllInstrumentsInBucket};
