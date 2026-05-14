import axios from "axios";

import { type AuditLog } from "../utils/auditLog.types";

import { logFunctionCall, logFunctionError } from "./logHelpers";
import axiosConfig from "./axiosConfig";

export async function getAuditLogs(): Promise<AuditLog[]> {
  logFunctionCall("getAuditLogs");
  const url = "/api/audit";

  try {
    const response = await axios.get(url, axiosConfig());

    return response.data;
  } catch (error: unknown) {
    logFunctionError("getAuditLogs", error);
    throw error;
  }
}
