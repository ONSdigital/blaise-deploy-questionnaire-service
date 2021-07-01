import logging from "./config";
import {IncomingMessage} from "http";

import {getEnvironmentVariables} from "../Config";
import {AuditLog} from "../../Interfaces";

const {PROJECT_ID} = getEnvironmentVariables();

const logName = `projects/${PROJECT_ID}/logs/stdout`; // The name of the log to write to

export const auditLogInfo = (logger: IncomingMessage["log"], message: string): void => {
    logger.info(`AUDIT_LOG: ${message}`);
};

export const auditLogError = (logger: IncomingMessage["log"], message: string): void => {
    logger.error(`AUDIT_LOG: ${message}`);
};

export const getAuditLogs = (): Promise<AuditLog[]> => {
    return new Promise((resolve: (object: AuditLog[]) => void, reject: (error: string) => void) => {
        const log = logging.log(logName);
        log.getEntries({filter: "jsonPayload.message=~\"^AUDIT_LOG: \"", maxResults: 50})
            .then(([entries]) => {
                const auditLogs: AuditLog[] = [];
                entries.map((entry) => {
                    let id = "";
                    let timestamp = "";
                    let severity = "INFO";
                    if (entry.metadata.insertId !== undefined && entry.metadata.insertId !== null) {
                        id = entry.metadata.insertId;
                    }
                    if (entry.metadata.timestamp !== undefined && entry.metadata.timestamp !== null) {
                        timestamp = entry.metadata.timestamp.toString();
                    }
                    if (entry.metadata.severity !== undefined && entry.metadata.severity !== null) {
                        severity = entry.metadata.severity.toString();
                    }
                    auditLogs.push({
                        id: id,
                        timestamp: timestamp,
                        message: entry.data.message.replace(/^AUDIT_LOG: /, ""),
                        severity: severity
                    });
                });
                resolve(auditLogs);
            })
            .catch(error => reject(error));
    });
};

module.exports = {getAuditLogs, auditLogInfo, auditLogError};
