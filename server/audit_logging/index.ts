import {Entry} from "@google-cloud/logging";
import logging from "./config";
import {IncomingMessage} from "http";

import {getEnvironmentVariables} from "../Config";
const {PROJECT_ID} = getEnvironmentVariables();

const logName = `projects/${PROJECT_ID}/logs/stdout`; // The name of the log to write to

export const auditLogInfo = (logger: IncomingMessage["log"], message: string): void => {
    logger.info(`AUDIT_LOG: ${message}`);
};

export const auditLogError = (logger: IncomingMessage["log"], message: string): void => {
    logger.error(`AUDIT_LOG: ${message}`);
};

export const getAuditLogs = (): Promise<Entry[]> => {
    return new Promise((resolve: (object: Entry[]) => void, reject: (error: string) => void) => {
        const log = logging.log(logName);
        log.getEntries({filter: "jsonPayload.message=~\"^AUDIT_LOG: \""})
            .then(([entries]) => resolve(entries))
            .catch(error => reject(error));
    });
};

module.exports = {getAuditLogs, auditLogInfo, auditLogError};
