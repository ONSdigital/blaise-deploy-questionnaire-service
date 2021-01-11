import {getEnvironmentVariables} from "../Config";
import path from "path";

const Cloud = require("@google-cloud/storage");
const {Storage} = Cloud;
const {PROJECT_ID} = getEnvironmentVariables();

let storageConfig = {
    projectId: PROJECT_ID,
};

if (process.env.NODE_ENV !== "production") {
    console.log("Not Prod: Attempting to use local keys.json file");
    const serviceKey = path.join(__dirname, "../../../keys.json");
    storageConfig = {
        projectId: PROJECT_ID,
        keyFilename: serviceKey,
    };
}

const storage = new Storage(storageConfig);

module.exports = storage;
