import {getEnvironmentVariables} from "../Config";
import path from "path";

import Cloud, {StorageOptions} from "@google-cloud/storage";

const {Storage} = Cloud;
const {PROJECT_ID} = getEnvironmentVariables();

let storageConfig = <StorageOptions>{
    projectId: PROJECT_ID,
};

if (process.env.NODE_ENV !== "production") {
    console.log("Not Prod: Attempting to use local keys.json file");
    const serviceKey = path.join(__dirname, "../../../keys.json");
    storageConfig = <StorageOptions>{
        projectId: PROJECT_ID,
        keyFilename: serviceKey,
    };
}

export const storage: Cloud.Storage = new Storage(storageConfig);
