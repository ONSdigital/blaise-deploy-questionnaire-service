import axios, { type AxiosProgressEvent } from "axios";

import { clientLogger } from "../utils/logger";

import { logFunctionCall, logFunctionError } from "./logHelpers";
import axiosConfig from "./axiosConfig";

export async function initialiseUpload(filename: string): Promise<string> {
  logFunctionCall("initialiseUpload", filename);
  const url = `/upload/init?filename=${encodeURIComponent(filename)}`;

  try {
    const response = await axios.get(url, axiosConfig());
    const signedUrlHostname = new URL(response.data).hostname;
    const isAllowedHost =
      signedUrlHostname === "storage.googleapis.com" ||
      signedUrlHostname.endsWith(".storage.googleapis.com");

    if (!isAllowedHost) {
      throw new Error(`Signed URL received was not an allowed storage host: ${signedUrlHostname}`);
    }

    return response.data;
  } catch (error: unknown) {
    logFunctionError("initialiseUpload", error, filename);
    throw error;
  }
}

export async function validateUploadIsComplete(filename: string): Promise<boolean> {
  logFunctionCall("validateUploadIsComplete", filename);
  const url = `/upload/verify?filename=${encodeURIComponent(filename)}`;

  try {
    const response = await axios.get(url, axiosConfig());

    return response.data.name === filename;
  } catch (error: unknown) {
    logFunctionError("validateUploadIsComplete", error, filename);

    return false;
  }
}

export async function uploadFile(
  url: string,
  file: File,
  onFileUploadProgress: (event: AxiosProgressEvent) => void,
): Promise<boolean> {
  const config = {
    onUploadProgress: onFileUploadProgress,
    headers: {
      "Content-Type": "application/octet-stream",
    },
  };

  logFunctionCall("uploadFile", file.name);
  try {
    await axios.put(url, file, config);
    clientLogger.info(`uploadFile(${file.name}) completed`);

    return true;
  } catch (error: unknown) {
    logFunctionError("uploadFile", error, file.name);

    return false;
  }
}

export async function getAllQuestionnairesInBucket(): Promise<string[]> {
  logFunctionCall("getAllQuestionnairesInBucket");
  const url = "/bucket/files";

  try {
    const response = await axios.get(url, axiosConfig());

    if (Array.isArray(response.data)) {
      return response.data as string[];
    }

    clientLogger.warn(
      `getAllQuestionnairesInBucket() returned a non-array response: ${JSON.stringify(response.data)}`,
    );

    return [];
  } catch (error: unknown) {
    logFunctionError("getAllQuestionnairesInBucket", error);
    throw error;
  }
}
