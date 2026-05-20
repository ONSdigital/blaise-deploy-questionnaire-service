import { type AxiosProgressEvent } from "axios";

import {
  shouldAskTmReleaseDate,
  shouldAskToStartDate,
} from "../../utils/deploymentDateQuestionRules";
import { clientLogger } from "../../utils/logger";
import {
  getStrictInterviewingSettings,
  validateCatiOnlySettings,
  validateQuestionnaireSettings,
} from "../../utils/questionnaireSettings";
import {
  deactivateQuestionnaire,
  getQuestionnaire,
  getQuestionnaireModes,
  getQuestionnaireSettings,
} from "../questionnaires";
import { setTmReleaseDate } from "../tmReleaseDate";
import { setToStartDate } from "../toStartDate";
import { initialiseUpload, uploadFile } from "../upload";

import { verifyAndInstallQuestionnaire } from ".";

import type { Questionnaire, QuestionnaireSettings } from "blaise-api-node-client";

export type ExistenceCheckResult =
  | { outcome: "error"; message: string }
  | { outcome: "exists"; questionnaireName: string; questionnaire: Questionnaire }
  | { outcome: "new"; questionnaireName: string };

export async function validateSelectedQuestionnaireExists(
  file: File,
): Promise<ExistenceCheckResult> {
  const questionnaireName = file.name.replace(/\.[a-zA-Z]*$/, "");

  let questionnaire: Questionnaire | undefined;

  try {
    questionnaire = await getQuestionnaire(questionnaireName);
  } catch {
    clientLogger.error(
      "validateSelectedQuestionnaireExists() failed while checking questionnaire existence",
    );

    return { outcome: "error", message: "Failed to validate if questionnaire already exists" };
  }

  if (questionnaire) {
    return { outcome: "exists", questionnaireName, questionnaire };
  }

  return { outcome: "new", questionnaireName };
}

export async function uploadAndInstallFile(
  questionnaireName: string,
  toStartDate: string | undefined,
  tmReleaseDate: string | undefined,
  file: File,
  onFileUploadProgress: (progressEvent: AxiosProgressEvent) => void,
): Promise<{ success: true } | { success: false; message: string }> {
  clientLogger.info(`uploadAndInstallFile(${questionnaireName}) started`);

  let signedUrl: string;

  try {
    signedUrl = await initialiseUpload(file.name);
  } catch {
    clientLogger.error(`uploadAndInstallFile(${questionnaireName}) failed during initialiseUpload`);

    return { success: false, message: "Failed to upload questionnaire" };
  }

  const uploaded = await uploadFile(signedUrl, file, onFileUploadProgress);

  if (!uploaded) {
    clientLogger.error(`uploadAndInstallFile(${questionnaireName}) failed during uploadFile`);

    return { success: false, message: "Failed to upload questionnaire" };
  }

  const [installed, message] = await verifyAndInstallQuestionnaire(file.name);

  if (!installed) {
    return { success: false, message };
  }

  // Changed: persist deployment dates only after upload and install succeed so failed deployments cannot leave orphaned metadata behind.
  return storeDeploymentDates(questionnaireName, toStartDate, tmReleaseDate);
}

async function storeDeploymentDates(
  questionnaireName: string,
  toStartDate: string | undefined,
  tmReleaseDate: string | undefined,
): Promise<{ success: true } | { success: false; message: string }> {
  if (shouldAskToStartDate(questionnaireName)) {
    clientLogger.info(
      `uploadAndInstallFile(${questionnaireName}) storing Telephone Operations start date`,
    );
    const toStartDateCreated = await setToStartDate(questionnaireName, toStartDate);

    if (!toStartDateCreated) {
      clientLogger.error(
        `uploadAndInstallFile(${questionnaireName}) failed while storing Telephone Operations start date`,
      );

      return { success: false, message: "Failed to store Telephone Operations start date" };
    }
  }

  if (shouldAskTmReleaseDate(questionnaireName)) {
    clientLogger.info(
      `uploadAndInstallFile(${questionnaireName}) storing Totalmobile release date`,
    );
    const tmReleaseDateCreated = await setTmReleaseDate(questionnaireName, tmReleaseDate);

    if (!tmReleaseDateCreated) {
      clientLogger.error(
        `uploadAndInstallFile(${questionnaireName}) failed while storing Totalmobile release date`,
      );

      return { success: false, message: "Failed to store Totalmobile release date" };
    }
  }

  return { success: true };
}

export type SettingsCheckResult =
  | { outcome: "valid" }
  | {
      outcome: "invalid";
      settings: QuestionnaireSettings;
      invalidSettings: Partial<QuestionnaireSettings>;
    }
  | { outcome: "error" };

export async function checkQuestionnaireSettings(
  questionnaireName: string,
): Promise<SettingsCheckResult> {
  let questionnaireSettingsList: QuestionnaireSettings[];
  let questionnaireModes: string[];

  try {
    questionnaireSettingsList = await getQuestionnaireSettings(questionnaireName);
    questionnaireModes = await getQuestionnaireModes(questionnaireName);
    if (questionnaireSettingsList.length == 0 || questionnaireModes.length == 0) {
      return { outcome: "error" };
    }
  } catch {
    return { outcome: "error" };
  }

  const questionnaireSettings = getStrictInterviewingSettings(questionnaireSettingsList);

  if (!questionnaireSettings) {
    // Changed: fail fast when StrictInterviewing settings are absent instead of fabricating an invalid object.
    return { outcome: "error" };
  }

  const isCatiModeOnly = questionnaireModes.length === 1 && questionnaireModes[0] === "CATI";

  const [valid, invalidSettings] = isCatiModeOnly
    ? validateCatiOnlySettings(questionnaireSettings)
    : validateQuestionnaireSettings(questionnaireSettings);

  if (!valid) {
    await deactivateQuestionnaire(questionnaireName);

    return { outcome: "invalid", settings: questionnaireSettings, invalidSettings };
  }

  return { outcome: "valid" };
}
