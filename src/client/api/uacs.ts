import axios from "axios";

import { clientLogger } from "../utils/logger";

import { logFunctionCall, logFunctionError } from "./logHelpers";
import axiosConfig from "./axiosConfig";
import { type InstrumentUacDetailsByCaseId } from "./uac.types";

export async function generateUacs(instrumentName: string): Promise<boolean> {
  logFunctionCall("generateUacs", instrumentName);
  const url = `/api/uacs/instrument/${instrumentName}`;

  try {
    const response = await axios.post(url, {}, axiosConfig());

    return response.status === 200;
  } catch (error: unknown) {
    logFunctionError("generateUacs", error, instrumentName);

    return false;
  }
}

export async function getUacCount(instrumentName: string): Promise<number> {
  logFunctionCall("getUacCount", instrumentName);
  const url = `/api/uacs/instrument/${instrumentName}/count`;

  try {
    const response = await axios.get(url, axiosConfig());

    if (typeof response.data.count !== "number") {
      throw new Error("Uac count was not a number");
    }

    return response.data.count;
  } catch (error: unknown) {
    logFunctionError("getUacCount", error, instrumentName);
    throw error;
  }
}

export async function getUacsByCaseId(
  instrumentName: string,
): Promise<InstrumentUacDetailsByCaseId> {
  logFunctionCall("getUacsByCaseId", instrumentName);
  const url = `/api/uacs/instrument/${instrumentName}/bycaseid`;

  try {
    const response = await axios.get(url, axiosConfig());

    return response.data;
  } catch (error: unknown) {
    logFunctionError("getUacsByCaseId", error, instrumentName);
    throw new Error("Failed to get Uacs by case ID", { cause: error });
  }
}
