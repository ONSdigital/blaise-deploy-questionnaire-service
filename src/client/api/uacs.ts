import axios from "axios";

import { clientLogger } from "../utils/logger";

import axiosConfig from "./axiosConfig";
import { type InstrumentUacDetailsByCaseId } from "./uac.types";

export async function generateUacs(instrumentName: string): Promise<boolean> {
  clientLogger.info("Sending request generate Uacs");
  const url = `/api/uacs/instrument/${instrumentName}`;

  try {
    const response = await axios.post(url, {}, axiosConfig());

    return response.status === 200;
  } catch (error: unknown) {
    clientLogger.error(`Failed to generate Uacs, Error ${error}`);

    return false;
  }
}

export async function getUacCount(instrumentName: string): Promise<number> {
  clientLogger.info(`Sending request to get Uac count for ${instrumentName}`);
  const url = `/api/uacs/instrument/${instrumentName}/count`;

  try {
    const response = await axios.get(url, axiosConfig());

    if (typeof response.data.count !== "number") {
      throw new Error("Uac count was not a number");
    }

    return response.data.count;
  } catch (error: unknown) {
    clientLogger.error(`Failed to get Uac count, Error ${error}`);
    throw error;
  }
}

export async function getUacsByCaseId(
  instrumentName: string,
): Promise<InstrumentUacDetailsByCaseId> {
  clientLogger.info(`Sending request to get Uacs by case ID ${instrumentName}`);
  const url = `/api/uacs/instrument/${instrumentName}/bycaseid`;

  try {
    const response = await axios.get(url, axiosConfig());

    return response.data;
  } catch (error: unknown) {
    clientLogger.error(`Failed to get Uacs by case ID, Error ${error}`);
    throw new Error("Failed to get Uacs by case ID", { cause: error });
  }
}
