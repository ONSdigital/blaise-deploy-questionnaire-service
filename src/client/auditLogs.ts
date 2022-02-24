import axios from "axios";
import { AuditLog } from "../server/auditLogging/logger";


export async function getAuditLogs(): Promise<AuditLog[]> {
    console.log("Call to getAuditLogs");
    const url = "/api/audit";

    const response = await axios.get(url);
    return response.data;
}
