import axios from "axios";

import { clientLogger } from "../client/logger";

import axiosConfig from "./axiosConfig";

function isAxios404(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  if (!("isAxiosError" in error) || !("response" in error)) {
    return false;
  }

  const axiosError = error as { isAxiosError?: boolean; response?: { status?: number } };

  return axiosError.isAxiosError === true && axiosError.response?.status === 404;
}

export async function setToStartDate(
  questionnaireName: string,
  toStartDate: string | undefined,
): Promise<boolean> {
  clientLogger.info(`Call to setToStartDate(${questionnaireName}, ${toStartDate})`);
  const url = `/api/tostartdate/${questionnaireName}`;
  const data = { tostartdate: toStartDate };

  try {
    const response = await axios.post(url, data, axiosConfig());

    return response.status === 200 || response.status === 201;
  } catch (error: unknown) {
    clientLogger.error(`Response from set start date Failed: Error ${error}`);

    return false;
  }
}

export async function getToStartDate(questionnaireName: string): Promise<string> {
  clientLogger.info(`Call to getToStartDate(${questionnaireName})`);
  const url = `/api/tostartdate/${questionnaireName}`;

  try {
    const response = await axios.get(url, axiosConfig());
    const toStartDate = response.data?.tostartdate;

    if (!toStartDate) {
      clientLogger.info(`No tostartdate returned for ${questionnaireName}`);

      return "";
    }

    return toStartDate;
  } catch (error: unknown) {
    if (isAxios404(error)) {
      return "";
    }

    clientLogger.error(`Response from set start date Failed: Error ${error}`);
    throw error;
  }
}

export async function deleteToStartDate(questionnaireName: string): Promise<boolean> {
  clientLogger.info(`Call to deleteToStartDate(${questionnaireName})`);
  const url = `/api/tostartdate/${questionnaireName}`;

  try {
    const response = await axios.delete(url, axiosConfig());

    return response.status === 204;
  } catch (error: unknown) {
    clientLogger.error(`Response from delete TO start date Failed: Error ${error}`);

    return false;
  }
}
