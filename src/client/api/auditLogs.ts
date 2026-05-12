import axios from "axios";

import { type AuditLog } from "../utils/auditLog.types";
import { clientLogger } from "../utils/logger";

import axiosConfig from "./axiosConfig";

export async function getAuditLogs(): Promise<AuditLog[]> {
  clientLogger.info("Call to getAuditLogs");
  const url = "/api/audit";

  const response = await axios.get(url, axiosConfig());

  return response.data;
}
