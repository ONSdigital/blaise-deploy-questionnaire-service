import axios from "axios";

import { clientLogger } from "../client/logger";

import axiosConfig from "./axiosConfig";
import { type InstrumentUacDetailsByCaseId } from "./types/uacDetails";

export async function generateUacs(instrumentName: string): Promise<boolean> {
  clientLogger.info("Sending request generate UAC codes");
  const url = `/api/uacs/instrument/${instrumentName}`;

  try {
    const response = await axios.post(url, {}, axiosConfig());

    return response.status === 200;
  } catch (error: unknown) {
    clientLogger.error(`Failed to generate UAC codes, Error ${error}`);

    return false;
  }
}

export async function getUacCount(instrumentName: string): Promise<number> {
  clientLogger.info(`Sending request to get UAC code count for ${instrumentName}`);
  const url = `/api/uacs/instrument/${instrumentName}/count`;

  try {
    const response = await axios.get(url, axiosConfig());

    if (typeof response.data.count !== "number") {
      throw new Error("UAC count was not a number");
    }

    return response.data.count;
  } catch (error: unknown) {
    clientLogger.error(`Failed to get UAC code count, Error ${error}`);
    throw error;
  }
}

export async function getUacsByCaseId(
  instrumentName: string,
): Promise<InstrumentUacDetailsByCaseId> {
  clientLogger.info(`Sending request to get UAC codes by case ID ${instrumentName}`);
  const url = `/api/uacs/instrument/${instrumentName}/bycaseid`;

  try {
    const response = await axios.get(url, axiosConfig());

    return response.data;
  } catch (error: unknown) {
    clientLogger.error(`Failed to get UAC codes by case ID, Error ${error}`);
    throw new Error("Failed to get UAC codes by case ID", { cause: error });
  }
}
