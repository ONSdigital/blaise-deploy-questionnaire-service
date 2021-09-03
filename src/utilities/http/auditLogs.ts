import {requestPromiseJsonList} from "./requestPromise";

type getAuditLogsResponse = [boolean, never[]];

function getAuditLogs(): Promise<getAuditLogsResponse> {
    console.log("Call to getAuditLogs");
    const url = "/api/audit";

    return requestPromiseJsonList("GET", url).then((response) => {
        return response;
    });
}

export {getAuditLogs};
