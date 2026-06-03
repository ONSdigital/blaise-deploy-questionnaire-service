import type { QuestionnaireSettings } from "blaise-api-node-client";

const REQUIRED_SETTINGS: Partial<QuestionnaireSettings> = {
  saveSessionOnTimeout: true,
  saveSessionOnQuit: true,
  deleteSessionOnTimeout: true,
  deleteSessionOnQuit: true,
  applyRecordLocking: true,
};

const REQUIRED_CATI_ONLY_SETTINGS: Partial<QuestionnaireSettings> = {
  saveSessionOnTimeout: true,
  saveSessionOnQuit: true,
  applyRecordLocking: true,
};

export function getStrictInterviewingSettings(
  questionnaireSettingsList: QuestionnaireSettings[],
): QuestionnaireSettings | undefined {
  for (const questionnaireSettings of questionnaireSettingsList) {
    if (questionnaireSettings.type === "StrictInterviewing") {
      return questionnaireSettings;
    }
  }
}

export function validateQuestionnaireSettings(
  questionnaireSettings: QuestionnaireSettings,
): [boolean, Partial<QuestionnaireSettings>] {
  return validateSettings(questionnaireSettings, REQUIRED_SETTINGS);
}

export function validateCatiOnlySettings(
  questionnaireSettings: QuestionnaireSettings,
): [boolean, Partial<QuestionnaireSettings>] {
  return validateSettings(questionnaireSettings, REQUIRED_CATI_ONLY_SETTINGS);
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
