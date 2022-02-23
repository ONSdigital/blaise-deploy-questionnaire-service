import { getEnvironmentVariables } from "../Config";
import path from "path";
import { Logging, LoggingOptions } from "@google-cloud/logging";

const { ProjectId } = getEnvironmentVariables();

let loggingConfig: LoggingOptions = {
    projectId: ProjectId,
};

if (process.env.NODE_ENV !== "production") {
    console.log("Not Prod: Attempting to use local keys.json file");
    const serviceKey = path.join(__dirname, "../../../keys.json");
    loggingConfig = {
        projectId: ProjectId,
        keyFilename: serviceKey,
    };
}

const logging = new Logging(loggingConfig);

export default logging;
