import { QuestionnaireMode } from "./questionnaireMode.js";

import type { QuestionnaireSettings } from "blaise-api-node-client";

const ValidMixedModeSettings: Partial<QuestionnaireSettings> = {
  saveSessionOnTimeout: true,
  saveSessionOnQuit: true,
  deleteSessionOnTimeout: true,
  deleteSessionOnQuit: true,
  applyRecordLocking: true,
};

const ValidCatiModeSettings: Partial<QuestionnaireSettings> = {
  saveSessionOnTimeout: true,
  saveSessionOnQuit: true,
  applyRecordLocking: true,
};

export function GetStrictInterviewingSettings(
  questionnaireSettingsList: QuestionnaireSettings[],
): QuestionnaireSettings {
  for (const questionnaireSettings of questionnaireSettingsList) {
    if (questionnaireSettings.type === "StrictInterviewing") {
      return questionnaireSettings;
    }
  }

  return {} as QuestionnaireSettings;
}

export function ValidateSettings(
  questionnaireSettings: QuestionnaireSettings,
  questionnaireMode: QuestionnaireMode,
): [boolean, Partial<QuestionnaireSettings>] {
  // TODO: make validation mode specific, replace CATI vs mixed
  if (questionnaireMode === QuestionnaireMode.Cati) {
    return ValidateCATIModeSettings(questionnaireSettings);
  }

  return ValidateMixedModeSettings(questionnaireSettings);
}

export function ValidateCATIModeSettings(
  questionnaireSettings: QuestionnaireSettings,
): [boolean, Partial<QuestionnaireSettings>] {
  return validateSettings(questionnaireSettings, ValidCatiModeSettings);
}

export function ValidateMixedModeSettings(
  questionnaireSettings: QuestionnaireSettings,
): [boolean, Partial<QuestionnaireSettings>] {
  return validateSettings(questionnaireSettings, ValidMixedModeSettings);
}

function setInvalidSetting<K extends keyof QuestionnaireSettings>(
  invalidSettings: Partial<QuestionnaireSettings>,
  property: K,
  value: QuestionnaireSettings[K] | undefined,
): void {
  invalidSettings[property] = value;
}

function validateSettings(
  questionnaireSettings: QuestionnaireSettings,
  validationSettings: Partial<QuestionnaireSettings>,
): [boolean, Partial<QuestionnaireSettings>] {
  const invalidSettings: Partial<QuestionnaireSettings> = {};

  for (const property of Object.keys(validationSettings) as Array<keyof QuestionnaireSettings>) {
    const value = validationSettings[property];

    if (questionnaireSettings[property] != value) {
      setInvalidSetting(invalidSettings, property, value);
    }
  }

  return [Object.keys(invalidSettings).length === 0, invalidSettings];
}
