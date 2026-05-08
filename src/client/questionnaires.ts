import axios from "axios";
import type { Questionnaire, QuestionnaireSettings } from "blaise-api-node-client";

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

export async function getQuestionnaire(
  questionnaireName: string,
): Promise<Questionnaire | undefined> {
  clientLogger.info(`Call to getQuestionnaire(${questionnaireName})`);
  const url = `/api/questionnaires/${questionnaireName}`;

  try {
    const response = await axios.get(url, axiosConfig());

    return response.data;
  } catch (error: unknown) {
    if (isAxios404(error)) {
      clientLogger.info(`Questionnaire ${questionnaireName} does not exist`);

      return undefined;
    }

    clientLogger.error(`Failed to get questionnaires ${error}`);
    throw error;
  }
}

export async function getQuestionnaires(): Promise<Questionnaire[]> {
  clientLogger.info("Call to getQuestionnaires");
  const url = "/api/questionnaires";

  const response = await axios.get(url, axiosConfig());

  return response.data;
}

export async function deleteQuestionnaire(questionnaireName: string): Promise<boolean> {
  clientLogger.info("Call to deleteQuestionnaire");
  const url = `/api/questionnaires/${questionnaireName}`;

  try {
    const response = await axios.delete(url, axiosConfig());

    return response.status === 204;
  } catch (error: unknown) {
    clientLogger.error(`Response from deleteQuestionnaire: Error ${error}`);

    return false;
  }
}

export async function activateQuestionnaire(questionnaireName: string): Promise<boolean> {
  clientLogger.info("Call to activateQuestionnaire");
  const url = `/api/questionnaires/${questionnaireName}/activate`;

  try {
    const response = await axios.patch(url, undefined, axiosConfig());

    return response.status === 204;
  } catch (error: unknown) {
    clientLogger.error(`Response from activateQuestionnaire: Error ${error}`);

    return false;
  }
}

export async function deactivateQuestionnaire(questionnaireName: string): Promise<boolean> {
  clientLogger.info("Call to deactivateQuestionnaire");
  const url = `/api/questionnaires/${questionnaireName}/deactivate`;

  try {
    const response = await axios.patch(url, undefined, axiosConfig());

    return response.status === 204;
  } catch (error: unknown) {
    clientLogger.error(`Response from deactivateQuestionnaire: Error ${error}`);

    return false;
  }
}

export async function installQuestionnaire(filename: string): Promise<boolean> {
  clientLogger.info("Sending request to start install");
  const url = "/api/install";

  try {
    const response = await axios.post(url, { filename: filename }, axiosConfig());

    return response.status === 201;
  } catch (error: unknown) {
    clientLogger.error(`Failed to install questionnaire, Error ${error}`);

    return false;
  }
}

export async function getQuestionnaireModes(questionnaireName: string): Promise<string[]> {
  clientLogger.info("Sending request get questionnaire modes");
  const url = `/api/questionnaires/${questionnaireName}/modes`;

  try {
    const response = await axios.get(url, axiosConfig());

    return response.data;
  } catch (error: unknown) {
    clientLogger.error(`Failed to get questionnaire modes, Error ${error}`);
    throw error;
  }
}

export async function getQuestionnaireSettings(
  questionnaireName: string,
): Promise<QuestionnaireSettings[]> {
  clientLogger.info("Sending request get questionnaire settings");
  const url = `/api/questionnaires/${questionnaireName}/settings`;

  try {
    const response = await axios.get(url, axiosConfig());

    return response.data;
  } catch (error: unknown) {
    clientLogger.error(`Failed to get questionnaire settings, Error ${error}`);
    throw error;
  }
}

export async function getQuestionnaireCaseIds(questionnaireName: string): Promise<string[]> {
  clientLogger.info("Call to getQuestionnaireCaseIds");
  const url = `/api/questionnaires/${questionnaireName}/cases/ids`;

  try {
    const response = await axios.get(url, axiosConfig());

    return response.data;
  } catch {
    throw new Error("Failed to get questionnaire case IDs");
  }
}

export async function getSurveyDays(questionnaireName: string): Promise<string[]> {
  clientLogger.info("Sending request get survey days");
  const url = `/api/questionnaires/${questionnaireName}/surveydays`;

  try {
    const response = await axios.get(url, axiosConfig());

    return response.data;
  } catch (error: unknown) {
    clientLogger.error(`Failed to get survey days, Error ${error}`);
    throw error;
  }
}

export async function surveyIsActive(questionnaireName: string): Promise<boolean> {
  clientLogger.info("Sending request get survey is active");
  const url = `/api/questionnaires/${questionnaireName}/active`;

  try {
    const response = await axios.get(url, axiosConfig());

    return response.data;
  } catch (error: unknown) {
    clientLogger.error(`Failed to get survey is active, Error ${error}`);
    throw error;
  }
}
