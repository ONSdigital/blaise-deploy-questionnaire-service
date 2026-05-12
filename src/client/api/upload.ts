import axios, { type AxiosProgressEvent } from "axios";

import { clientLogger } from "../utils/logger";

import axiosConfig from "./axiosConfig";

export async function initialiseUpload(filename: string): Promise<string> {
  clientLogger.info(`Call to initialiseUpload(${filename})`);
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
    clientLogger.error(`Response from initialise Upload: Error ${error}`);
    throw error;
  }
}

export async function validateUploadIsComplete(filename: string): Promise<boolean> {
  clientLogger.info(`Call to validateUploadIsComplete(${filename})`);
  const url = `/upload/verify?filename=${encodeURIComponent(filename)}`;

  try {
    const response = await axios.get(url, axiosConfig());

    return response.data.name === filename;
  } catch (error: unknown) {
    clientLogger.error(`Response from check bucket Failed: Error ${error}`);

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

  clientLogger.info("Uploading to bucket");
  try {
    await axios.put(url, file, config);
    clientLogger.info("File successfully uploaded");

    return true;
  } catch (error: unknown) {
    clientLogger.error(`File failed to upload ${error}`);

    return false;
  }
}

export async function getAllQuestionnairesInBucket(): Promise<string[]> {
  clientLogger.info("Call to getAllQuestionnairesInBucket");
  const url = "/bucket/files";

  try {
    const response = await axios.get(url, axiosConfig());

    if (Array.isArray(response.data)) {
      return response.data as string[];
    }

    clientLogger.warn(
      `Response from getAllQuestionnairesInBucket was not an array, received: ${JSON.stringify(response.data)}`,
    );

    return [];
  } catch (error: unknown) {
    clientLogger.error(`Failed to get questionnaires in bucket: ${error}`);
    throw error;
  }
}
