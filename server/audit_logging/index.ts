import {Entry} from "@google-cloud/logging";
import logging from "./config";

const logName = "blaise-dqs-audit"; // The name of the log to write to

export const logToAudit = (message: string, severity: string): void => {
    // Selects the log to write to
    const log = logging.log(logName);

    // The metadata associated with the entry
    const metadata = {
        resource: {type: "global"},
        // See: https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#logseverity
        severity: severity,
    };

    // Prepares a log entry
    const entry = log.entry(metadata, message);

    async function writeLog() {
        // Writes the log entry
        await log.write(entry);
        console.log(`Logged: ${message}`);
    }

    writeLog().then(() => console.log(`Logged: ${message}`)).catch(error => console.log(error));
};

export const getAuditLogs = (): Promise<Entry[]> => {
    return new Promise((resolve: (object: Entry[]) => void, reject: (error: string) => void) => {
        const log = logging.log(logName);

        log.getEntries()
            .then(([entries]) => resolve(entries))
            .catch(error => reject(error));
    });
};

module.exports = {getAuditLogs, logToAudit};
