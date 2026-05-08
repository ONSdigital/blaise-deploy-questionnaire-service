import axios from "axios";

import { clientLogger } from "../client/logger";
import { type AuditLog } from "../types/auditLog";

import axiosConfig from "./axiosConfig";

export async function getAuditLogs(): Promise<AuditLog[]> {
  clientLogger.info("Call to getAuditLogs");
  const url = "/api/audit";

  const response = await axios.get(url, axiosConfig());

  return response.data;
}
