import {getEnvironmentVariables} from "../Config";

const util = require("util");
const gc = require("./config");

const {BUCKET_NAME} = getEnvironmentVariables();
const bucket = gc.bucket(BUCKET_NAME);

const {format} = util;

/**
 *
 * @param { File } object file object that will be uploaded
 * @description - This function does the following
 * - It uploads a file to the image bucket on Google Cloud
 * - It accepts an object as an argument with the
 *   "originalname" and "buffer" as keys
 */

const uploadImage = (file) => new Promise((resolve, reject) => {
    const {name} = file;

    const blob = bucket.file(name.replace(/ /g, "_"));
    const blobStream = blob.createWriteStream({
        resumable: false
    });

    console.log(`Bucket ${bucket.name}`);

    blobStream.on("finish", () => {
        console.log("upload finished ");
        const publicUrl = format(
            `https://storage.googleapis.com/${bucket.name}/${blob.name}`
        );
        resolve(publicUrl);
    }).on("error", (error) => {
        console.log("blobStream failed");
        reject("Unable to upload image, something went wrong");
    }).end(file.getContent());

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

module.exports = {uploadImage, checkFile};
