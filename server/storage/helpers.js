import {getEnvironmentVariables} from "../Config";

const util = require("util");
const gc = require("./config");

const {BUCKET_NAME} = getEnvironmentVariables();
const bucket = gc.bucket(BUCKET_NAME);

const {format} = util;

export const getSignedUrl = (filename) => new Promise((resolve, reject) => {
    async function getSignedUrl() {
        const maxAgeSeconds = 3600;
        const method = ["GET", "HEAD", "DELETE", "PUT", "POST"];
        const origin = [
            "http://localhost:3001",
            "http://localhost:5000",
            "https://mattest-dot-dqs-ui-dot-ons-blaise-v2-dev-matt58.nw.r.appspot.com",
            "https://dqs-ui-dot-ons-blaise-v2-dev-matt58.nw.r.appspot.com",
            "https://mattest-dot-dqs-ui-dot-ons-blaise-v2-dev.nw.r.appspot.com"
        ];
        const responseHeader = "content-type";


        await bucket.setCorsConfiguration([
            {
                maxAgeSeconds,
                method: [method],
                origin: [origin],
                responseHeader: [responseHeader],
            },
        ]);

        const options = {
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

    getSignedUrl()
        .then((url) => {
            resolve(url);
        }).catch((error) => {
        reject(error);
    });
});

export const checkFile = (filename) => new Promise((resolve, reject) => {
    async function getMetadata() {
        // Gets the metadata for the file
        const [metadata] = await bucket.file(filename).getMetadata();

        const file = {
            name: metadata.name,
            updated: metadata.updated,
            found: true
        };
        return file;
    }

    getMetadata()
        .then((file) => {
            resolve(file);
        }).catch((error) => {
        console.log(error.code);
        if (error.code === 404) {
            resolve({ found: false});
        }
        reject(`Failed ${error}`);
    });
});


module.exports = {uploadImage, checkFile, getSignedUrl};
