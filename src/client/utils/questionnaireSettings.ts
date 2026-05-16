import type { QuestionnaireSettings } from "blaise-api-node-client";

const ValidSettings: Partial<QuestionnaireSettings> = {
  saveSessionOnTimeout: true,
  saveSessionOnQuit: true,
  deleteSessionOnTimeout: true,
  deleteSessionOnQuit: true,
  applyRecordLocking: true,
};

const ValidCatiModeOnlySettings: Partial<QuestionnaireSettings> = {
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
): [boolean, Partial<QuestionnaireSettings>] {
  return validateSettings(questionnaireSettings, ValidSettings);
}

export function ValidateCatiModeOnlySettings(
  questionnaireSettings: QuestionnaireSettings,
): [boolean, Partial<QuestionnaireSettings>] {
  return validateSettings(questionnaireSettings, ValidCatiModeOnlySettings);
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
