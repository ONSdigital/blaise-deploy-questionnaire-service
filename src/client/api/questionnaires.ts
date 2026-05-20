import axios from "axios";

import { clientLogger } from "../utils/logger";

import axiosConfig from "./axiosConfig";
import { formatFunctionCall, logFunctionCall, logFunctionError } from "./logHelpers";

import type { Questionnaire, QuestionnaireSettings } from "blaise-api-node-client";

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

function isAxios404(error: unknown): boolean {
  return getAxiosStatus(error) === 404;
}

export async function getQuestionnaire(
  questionnaireName: string,
): Promise<Questionnaire | undefined> {
  logFunctionCall("getQuestionnaire", questionnaireName);
  const url = `/api/questionnaires/${questionnaireName}`;

  try {
    const response = await axios.get(url, axiosConfig());

    return response.data;
  } catch (error: unknown) {
    if (isAxios404(error)) {
      clientLogger.info(
        `${formatFunctionCall("getQuestionnaire", questionnaireName)} returned 404`,
      );

      return undefined;
    }

    logFunctionError("getQuestionnaire", error, questionnaireName);
    throw error;
  }
}

export async function getQuestionnaires(): Promise<Questionnaire[]> {
  logFunctionCall("getQuestionnaires");
  const url = "/api/questionnaires";

  try {
    const response = await axios.get(url, axiosConfig());

    return response.data;
  } catch (error: unknown) {
    logFunctionError("getQuestionnaires", error);
    throw error;
  }
}

export async function deleteQuestionnaire(questionnaireName: string): Promise<boolean> {
  logFunctionCall("deleteQuestionnaire", questionnaireName);
  const url = `/api/questionnaires/${questionnaireName}`;

  try {
    const response = await axios.delete(url, axiosConfig());

    return response.status === 204;
  } catch (error: unknown) {
    logFunctionError("deleteQuestionnaire", error, questionnaireName);

    return false;
  }
}

export async function activateQuestionnaire(questionnaireName: string): Promise<boolean> {
  logFunctionCall("activateQuestionnaire", questionnaireName);
  const url = `/api/questionnaires/${questionnaireName}/activate`;

  try {
    const response = await axios.patch(url, undefined, axiosConfig());

    return response.status === 204;
  } catch (error: unknown) {
    logFunctionError("activateQuestionnaire", error, questionnaireName);

    return false;
  }
}

export async function deactivateQuestionnaire(questionnaireName: string): Promise<boolean> {
  logFunctionCall("deactivateQuestionnaire", questionnaireName);
  const url = `/api/questionnaires/${questionnaireName}/deactivate`;

  try {
    const response = await axios.patch(url, undefined, axiosConfig());

    return response.status === 204;
  } catch (error: unknown) {
    logFunctionError("deactivateQuestionnaire", error, questionnaireName);

    return false;
  }
}

export async function installQuestionnaire(filename: string): Promise<boolean> {
  logFunctionCall("installQuestionnaire", filename);
  const url = "/api/install";

  try {
    const response = await axios.post(url, { filename }, axiosConfig());

    return response.status === 201;
  } catch (error: unknown) {
    logFunctionError("installQuestionnaire", error, filename);

    return false;
  }
}

export async function getQuestionnaireModes(questionnaireName: string): Promise<string[]> {
  logFunctionCall("getQuestionnaireModes", questionnaireName);
  const url = `/api/questionnaires/${questionnaireName}/modes`;

  try {
    const response = await axios.get(url, axiosConfig());

    return response.data;
  } catch (error: unknown) {
    logFunctionError("getQuestionnaireModes", error, questionnaireName);
    throw error;
  }
}

export async function getQuestionnaireSettings(
  questionnaireName: string,
): Promise<QuestionnaireSettings[]> {
  logFunctionCall("getQuestionnaireSettings", questionnaireName);
  const url = `/api/questionnaires/${questionnaireName}/settings`;

  try {
    const response = await axios.get(url, axiosConfig());

    return response.data;
  } catch (error: unknown) {
    logFunctionError("getQuestionnaireSettings", error, questionnaireName);
    throw error;
  }
}

export async function getQuestionnaireCaseIds(questionnaireName: string): Promise<string[]> {
  logFunctionCall("getQuestionnaireCaseIds", questionnaireName);
  const url = `/api/questionnaires/${questionnaireName}/cases/ids`;

  try {
    const response = await axios.get(url, axiosConfig());

    return response.data;
  } catch (error: unknown) {
    logFunctionError("getQuestionnaireCaseIds", error, questionnaireName);
    throw new Error("Failed to get questionnaire case IDs", { cause: error });
  }
}

export async function getSurveyDays(questionnaireName: string): Promise<string[]> {
  logFunctionCall("getSurveyDays", questionnaireName);
  const url = `/api/questionnaires/${questionnaireName}/surveydays`;

  try {
    const response = await axios.get(url, axiosConfig());

    return response.data;
  } catch (error: unknown) {
    logFunctionError("getSurveyDays", error, questionnaireName);
    throw error;
  }
}

export async function surveyIsActive(questionnaireName: string): Promise<boolean> {
  logFunctionCall("surveyIsActive", questionnaireName);
  const url = `/api/questionnaires/${questionnaireName}/active`;

  try {
    const response = await axios.get(url, axiosConfig());

    return response.data;
  } catch (error: unknown) {
    logFunctionError("surveyIsActive", error, questionnaireName);
    throw error;
  }
}
