import {getEnvironmentVariables} from "../Config";
import path from "path";
import {Logging, LoggingOptions} from "@google-cloud/logging";

const {PROJECT_ID} = getEnvironmentVariables();

let loggingConfig: LoggingOptions = {
    projectId: PROJECT_ID,
};

if (process.env.NODE_ENV !== "production") {
    console.log("Not Prod: Attempting to use local keys.json file");
    const serviceKey = path.join(__dirname, "../../../keys.json");
    loggingConfig = {
        projectId: PROJECT_ID,
        keyFilename: serviceKey,
    };
}

const logging = new Logging(loggingConfig);

// module.exports = logging;
export default logging;
