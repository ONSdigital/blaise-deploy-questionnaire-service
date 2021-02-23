import {getEnvironmentVariables} from "../Config";

import {storage} from "./config";
import {GetSignedUrlConfig} from "@google-cloud/storage";
import {rejects} from "assert";

const {BUCKET_NAME} = getEnvironmentVariables();
const bucket = storage.bucket(BUCKET_NAME);

const getSignedUrl = (filename: string): Promise<string> => new Promise((resolve, reject) => {
    async function setCORS() {
        const maxAgeSeconds = 3600;
        const method = ["PUT"];
        const origin = ["*"];
        const responseHeader = "content-type";

        await bucket.setCorsConfiguration([
            {
                maxAgeSeconds,
                method: method,
                origin: origin,
                responseHeader: [responseHeader],
            },
        ]);
    }

    async function getSignedUrl() {

        const options = <GetSignedUrlConfig>{
            version: "v4",
            action: "write",
            expires: Date.now() + 15 * 60 * 1000, // 15 minutes
            contentType: "application/octet-stream",
        };

        // Get a v4 signed URL for uploading file
        const [url] = await bucket
            .file(filename)
            .getSignedUrl(options);
        return url;
    }

    setCORS()
        .then(() => {
            getSignedUrl()
                .then((url) => {
                    resolve(url);
                }).catch((error) => {
                console.error(error, "getSignedUrl Failed");
                reject("getSignedUrl Failed");
            });
        }).catch((error) => {
        console.error(error, "setCORS Failed");
        reject("setCORS Failed");
    });
});

interface file {
    name?: string
    updated?: string
    found: boolean
}

const checkFile = (filename: string): Promise<file> => new Promise((resolve, reject) => {
    async function getMetadata() {
        // Gets the metadata for the file
        const [metadata] = await bucket.file(filename).getMetadata();

        return {
            name: metadata.name,
            updated: metadata.updated,
            found: true
        };
    }

    getMetadata()
        .then((file) => {
            resolve(file);
        }).catch((error) => {
        console.log(error.code);
        if (error.code === 404) {
            resolve({found: false});
        }
        reject(`Failed ${error}`);
    });
});


export {checkFile, getSignedUrl};
