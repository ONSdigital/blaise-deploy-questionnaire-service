
import { QuestionnaireSettings } from "blaise-api-node-client";
import { QuestionnaireMode } from "./questionnaireMode";

export const ValidMixedModeSettings: Partial<QuestionnaireSettings> = {
    saveSessionOnTimeout: true,
    saveSessionOnQuit: true,
    deleteSessionOnTimeout: true,
    deleteSessionOnQuit: true,
    applyRecordLocking: true,
};

export const ValidCatiModeSettings: Partial<QuestionnaireSettings> = {
    saveSessionOnTimeout: true,
    saveSessionOnQuit: true,
    applyRecordLocking: true,
};

export function GetStrictInterviewingSettings(questionnaireSettingsList: QuestionnaireSettings[]): QuestionnaireSettings {
    for (const questionnaireSettings of questionnaireSettingsList) {
        if (questionnaireSettings.type === "StrictInterviewing") {
            return questionnaireSettings;
        }
    }
    return {} as QuestionnaireSettings;
}

export function ValidateSettings(questionnaireSettings: QuestionnaireSettings, questionnaireMode: QuestionnaireMode): [boolean, Partial<QuestionnaireSettings>] {
    if (questionnaireMode === QuestionnaireMode.Cati) {
        return ValidateCATIModeSettings(questionnaireSettings);
    }
    return ValidateMixedModeSettings(questionnaireSettings);
}

export function ValidateCATIModeSettings(questionnaireSettings: QuestionnaireSettings): [boolean, Partial<QuestionnaireSettings>] {
    return validateSettings(questionnaireSettings, ValidCatiModeSettings);
}

export function ValidateMixedModeSettings(questionnaireSettings: QuestionnaireSettings): [boolean, Partial<QuestionnaireSettings>] {
    return validateSettings(questionnaireSettings, ValidMixedModeSettings);
}

function validateSettings(questionnaireSettings: QuestionnaireSettings, validationSettings: Partial<QuestionnaireSettings>): [boolean, Partial<QuestionnaireSettings>] {
    const invalidSettings: any = {};
    for (const [property, value] of Object.entries(validationSettings)) {
        if (questionnaireSettings[property as keyof QuestionnaireSettings] != value) {
            invalidSettings[property] = value;
        }
    }
    return [Object.keys(invalidSettings).length === 0, invalidSettings];
}
