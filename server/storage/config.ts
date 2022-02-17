import {getEnvironmentVariables} from "../Config";
import path from "path";

import Cloud, {Storage, StorageOptions} from "@google-cloud/storage";

const {ProjectId} = getEnvironmentVariables();

let storageConfig = <StorageOptions>{
    projectId: ProjectId,
};

if (process.env.NODE_ENV !== "production") {
    console.log("Not Prod: Attempting to use local keys.json file");
    const serviceKey = path.join(__dirname, "../../../keys.json");
    storageConfig = <StorageOptions>{
        projectId: ProjectId,
        keyFilename: serviceKey,
    };
}

export const storage: Cloud.Storage = new Storage(storageConfig);
