import axios from "axios";

import { clientLogger } from "../utils/logger";

import axiosConfig from "./axiosConfig";
import { formatFunctionCall, logFunctionCall, logFunctionError } from "./logHelpers";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getAxiosStatus(error: unknown): number | undefined {
  if (!isRecord(error) || error.isAxiosError !== true) {
    return undefined;
  }

  const { response } = error;

  return isRecord(response) && typeof response.status === "number" ? response.status : undefined;
}

function isAxiosStatus(error: unknown, statuses: number[]): boolean {
  const status = getAxiosStatus(error);

  return status !== undefined && statuses.includes(status);
}

interface DateClientOptions {
  apiPath: string;
  fieldKey: string;
  logLabel?: string;
  notFoundStatuses?: number[];
  parseResponseData?: (data: unknown) => string;
}

function defaultParseResponseData(fieldKey: string): (data: unknown) => string {
  return (data: unknown): string => {
    if (data === null || data === undefined) {
      return "";
    }

    if (isRecord(data)) {
      const value = data[fieldKey];

      return typeof value === "string" ? value : "";
    }

    return "";
  };
}

export interface DateClient {
  set(questionnaireName: string, value: string | undefined): Promise<boolean>;
  get(questionnaireName: string): Promise<string>;
  delete(questionnaireName: string): Promise<boolean>;
}

export function createDateClient(options: DateClientOptions): DateClient {
  const {
    apiPath,
    fieldKey,
    logLabel = fieldKey,
    notFoundStatuses = [404],
    parseResponseData = defaultParseResponseData(fieldKey),
  } = options;

  async function set(questionnaireName: string, value: string | undefined): Promise<boolean> {
    const functionName = `set${logLabel}`;

    logFunctionCall(functionName, questionnaireName, value);
    const url = `/api/${apiPath}/${questionnaireName}`;

    try {
      const response = await axios.post(url, { [fieldKey]: value }, axiosConfig());

      return response.status === 200 || response.status === 201;
    } catch (error: unknown) {
      logFunctionError(functionName, error, questionnaireName, value);

      return false;
    }
  }

  async function get(questionnaireName: string): Promise<string> {
    const functionName = `get${logLabel}`;

    logFunctionCall(functionName, questionnaireName);
    const url = `/api/${apiPath}/${questionnaireName}`;

    try {
      const response = await axios.get(url, axiosConfig());
      const value = parseResponseData(response.data);

      if (!value) {
        clientLogger.info(
          `${formatFunctionCall(functionName, questionnaireName)} returned no value`,
        );

        return "";
      }

      return value;
    } catch (error: unknown) {
      if (isAxiosStatus(error, notFoundStatuses)) {
        clientLogger.info(
          `${formatFunctionCall(functionName, questionnaireName)} returned no value`,
        );

        return "";
      }

      logFunctionError(functionName, error, questionnaireName);
      throw error;
    }
  }

  async function del(questionnaireName: string): Promise<boolean> {
    const functionName = `delete${logLabel}`;

    logFunctionCall(functionName, questionnaireName);
    const url = `/api/${apiPath}/${questionnaireName}`;

    try {
      const response = await axios.delete(url, axiosConfig());

      return response.status === 204;
    } catch (error: unknown) {
      logFunctionError(functionName, error, questionnaireName);

      return false;
    }
  }

  return { set, get, delete: del };
}
