import axios from "axios";

import { clientLogger } from "../client/logger";

import axiosConfig from "./axiosConfig";

type TmReleaseDateResponse =
  | {
      tmreleasedate?: string;
    }
  | string
  | null
  | undefined;

function isAxiosStatus(error: unknown, statuses: number[]): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  if (!("isAxiosError" in error) || !("response" in error)) {
    return false;
  }

  const axiosError = error as { isAxiosError?: boolean; response?: { status?: number } };

  return axiosError.isAxiosError === true && statuses.includes(axiosError.response?.status ?? -1);
}

function getTmReleaseDateValue(data: TmReleaseDateResponse): string {
  if (typeof data === "string") {
    return data;
  }

  if (data && typeof data === "object" && typeof data.tmreleasedate === "string") {
    return data.tmreleasedate;
  }

  return "";
}

export async function setTmReleaseDate(
  questionnaireName: string,
  tmReleaseDate: string | undefined,
): Promise<boolean> {
  clientLogger.info(`Call to setTmReleaseDate(${questionnaireName}, ${tmReleaseDate})`);
  const url = `/api/tmreleasedate/${questionnaireName}`;
  const data = { tmreleasedate: tmReleaseDate };

  try {
    const response = await axios.post(url, data, axiosConfig());

    return response.status === 200 || response.status === 201;
  } catch (error: unknown) {
    clientLogger.error(`Response from set release date Failed: Error ${error}`);

    return false;
  }
}

export async function getTmReleaseDate(questionnaireName: string): Promise<string> {
  clientLogger.info(`Call to getTmReleaseDate(${questionnaireName})`);
  const url = `/api/tmreleasedate/${questionnaireName}`;

  try {
    const response = await axios.get(url, axiosConfig());
    const tmReleaseDate = getTmReleaseDateValue(response.data as TmReleaseDateResponse);

    if (!tmReleaseDate) {
      clientLogger.info(`No tmreleasedate returned for ${questionnaireName}`);

      return "";
    }

    return tmReleaseDate;
  } catch (error: unknown) {
    if (isAxiosStatus(error, [204, 404])) {
      return "";
    }

    clientLogger.error(`Response from set release date Failed: Error ${error}`);
    throw error;
  }
}

export async function deleteTmReleaseDate(questionnaireName: string): Promise<boolean> {
  clientLogger.info(`Call to deleteTmReleaseDate(${questionnaireName})`);
  const url = `/api/tmreleasedate/${questionnaireName}`;

  try {
    const response = await axios.delete(url, axiosConfig());

    return response.status === 204;
  } catch (error: unknown) {
    clientLogger.error(`Response from delete TM release date Failed: Error ${error}`);

    return false;
  }
}
