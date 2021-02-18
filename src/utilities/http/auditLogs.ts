import {requestPromiseJson} from "./requestPromise";

type getAuditLogsResponse = [boolean, never[]];

function getAuditLogs(): Promise<getAuditLogsResponse> {
    let list: never[] = [];
    console.log("Call to getAuditLogs");
    const url = "/api/audit";

    return new Promise((resolve: (object: getAuditLogsResponse) => void) => {
        requestPromiseJson("GET", url).then(([status, data]) => {
            console.log(`Response from get audit logs: Status ${status}, data ${data}`);
            if (status === 200) {
                if (!Array.isArray(data)) {
                    resolve([false, list]);
                }
                list = data;
                resolve([true, list]);
            } else if (status === 404) {
                resolve([true, list]);
            } else {
                resolve([false, list]);
            }
        }).catch((error: Error) => {
            console.error(`Response from get all audit Failed: Error ${error}`);
            resolve([false, list]);
        });
    });
}

export {getAuditLogs};
