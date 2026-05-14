import { type AxiosProgressEvent } from "axios";

import {
  shouldAskTmReleaseDate,
  shouldAskToStartDate,
} from "../../utils/deploymentDateQuestionRules";
import { clientLogger } from "../../utils/logger";
import { GetQuestionnaireMode } from "../../utils/questionnaireMode";
import { GetStrictInterviewingSettings, ValidateSettings } from "../../utils/questionnaireSettings";
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

export async function validateSelectedQuestionnaireExists(
  file: File | undefined,
  setQuestionnaireName: (status: string) => void,
  setUploadStatus: (status: string) => void,
  setFoundQuestionnaire: (object: Questionnaire | null) => void,
): Promise<boolean | null> {
  if (file === undefined) {
    return null;
  }

  const fileName = file.name;
  const questionnaireName = fileName.replace(/\.[a-zA-Z]*$/, "");

  setQuestionnaireName(questionnaireName);

  let questionnaire: Questionnaire | undefined;

  try {
    questionnaire = await getQuestionnaire(questionnaireName);
  } catch {
    clientLogger.error("validateSelectedQuestionnaireExists() failed while checking questionnaire existence");
    setUploadStatus("Failed to validate if questionnaire already exists");

    return null;
  }

  if (questionnaire) {
    setFoundQuestionnaire(questionnaire);

    return true;
  }

  return false;
}

export async function uploadAndInstallFile(
  questionnaireName: string,
  toStartDate: string | undefined,
  tmReleaseDate: string | undefined,
  file: File | undefined,
  setUploading: (boolean: boolean) => void,
  setUploadStatus: (status: string) => void,
  onFileUploadProgress: (progressEvent: AxiosProgressEvent) => void,
): Promise<boolean> {
  if (file === undefined) {
    return false;
  }

  clientLogger.info(`uploadAndInstallFile(${questionnaireName}) started`);

  if (shouldAskToStartDate(questionnaireName)) {
    clientLogger.info(`uploadAndInstallFile(${questionnaireName}) storing Telephone Operations start date`);
    const toStartDateCreated = await setToStartDate(questionnaireName, toStartDate);

    if (!toStartDateCreated) {
      clientLogger.error(
        `uploadAndInstallFile(${questionnaireName}) failed while storing Telephone Operations start date`,
      );
      setUploadStatus("Failed to store Telephone Operations start date");
      setUploading(false);

      return false;
    }
  }

  if (shouldAskTmReleaseDate(questionnaireName)) {
    clientLogger.info(`uploadAndInstallFile(${questionnaireName}) storing Totalmobile release date`);
    const tmReleaseDateCreated = await setTmReleaseDate(questionnaireName, tmReleaseDate);

    if (!tmReleaseDateCreated) {
      clientLogger.error(
        `uploadAndInstallFile(${questionnaireName}) failed while storing Totalmobile release date`,
      );
      setUploadStatus("Failed to store Totalmobile release date");
      setUploading(false);

      return false;
    }
  }

  let signedUrl: string;

  try {
    signedUrl = await initialiseUpload(file.name);
  } catch {
    clientLogger.error(`uploadAndInstallFile(${questionnaireName}) failed during initialiseUpload`);
    setUploadStatus("Failed to upload questionnaire");
    setUploading(false);

    return false;
  }

  setUploading(true);

  const uploaded = await uploadFile(signedUrl, file, onFileUploadProgress);

  setUploading(false);
  if (!uploaded) {
    clientLogger.error(`uploadAndInstallFile(${questionnaireName}) failed during uploadFile`);
    setUploadStatus("Failed to upload questionnaire");

    return false;
  }

  const [installed, message] = await verifyAndInstallQuestionnaire(file.name);

  if (!installed) {
    setUploadStatus(message);
  }

  return installed;
}

export async function checkQuestionnaireSettings(
  questionnaireName: string,
  setQuestionnaireSettings: (questionnaireSettings: QuestionnaireSettings) => void,
  setInvalidSettings: (invalidSettings: Partial<QuestionnaireSettings>) => void,
  setErrored: (errored: boolean) => void,
): Promise<boolean> {
  let questionnaireSettingsList: QuestionnaireSettings[];
  let questionnaireModes: string[];

  try {
    questionnaireSettingsList = await getQuestionnaireSettings(questionnaireName);
    questionnaireModes = await getQuestionnaireModes(questionnaireName);
    if (questionnaireSettingsList.length == 0 || questionnaireModes.length == 0) {
      setErrored(true);

      return false;
    }
  } catch {
    setErrored(true);

    return false;
  }

  const questionnaireSettings = GetStrictInterviewingSettings(questionnaireSettingsList);

  setQuestionnaireSettings(questionnaireSettings);
  // TODO: validate questionnaire settings using the questionnaire's actual modes
  const [valid, invalidSettings] = ValidateSettings(
    questionnaireSettings,
    GetQuestionnaireMode(questionnaireModes),
  );

  setInvalidSettings(invalidSettings);

  if (!valid) {
    deactivateQuestionnaire(questionnaireName);
  }

  return valid;
}
