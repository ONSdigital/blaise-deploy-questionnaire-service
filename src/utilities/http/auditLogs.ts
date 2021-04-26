import {requestPromiseJsonList} from "./requestPromise";

type getAuditLogsResponse = [boolean, never[]];

function getAuditLogs(): Promise<getAuditLogsResponse> {
    console.log("Call to getAuditLogs");
    const url = "/api/audit";

    return new Promise((resolve: (object: getAuditLogsResponse) => void) => {
        requestPromiseJsonList("GET", url).then(([success, data]) => {
            console.log(`Response from get audit logs ${(success ? "successful" : "failed")}, data list length ${data.length}`);
            resolve([success, data]);
        }).catch((error: Error) => {
            console.error(`Response from get audit logs Failed: Error ${error}`);
            resolve([false, []]);
        });
    });
}

export {getAuditLogs};
