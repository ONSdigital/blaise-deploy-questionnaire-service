import axios from "axios";

import { type AuditLog } from "../utils/auditLog.types";

import axiosConfig from "./axiosConfig";
import { logFunctionCall, logFunctionError } from "./logHelpers";

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
