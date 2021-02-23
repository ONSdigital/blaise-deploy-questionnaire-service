import {getEnvironmentVariables} from "../Config";

const gc = require("./config");
const {BUCKET_NAME} = getEnvironmentVariables();
const bucket = gc.bucket(BUCKET_NAME);

export const getSignedUrl = (filename) => new Promise((resolve) => {
    async function setCORS() {
        const maxAgeSeconds = 3600;
        const method = ["PUT"];
        const origin = [
            "*"
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
    }

    async function getSignedUrl() {

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

    setCORS()
        .then(() => {
            getSignedUrl()
                .then((url) => {
                    resolve(url);
                }).catch((error) => {
                console.error(error, "getSignedUrl Failed");
                resolve(null);
            });
        }).catch((error) => {
        console.error(error, "setCORS Failed");
        resolve(null);
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
            resolve({found: false});
        }
        reject(`Failed ${error}`);
    });
});


module.exports = {checkFile, getSignedUrl};
