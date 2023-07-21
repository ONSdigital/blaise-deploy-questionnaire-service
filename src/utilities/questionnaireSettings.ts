
import { IQuestionnaireSettings } from "blaise-api-node-client";
import { QuestionnaireMode } from "./questionnaireMode";

export const ValidMixedModeSettings: Partial<IQuestionnaireSettings> = {
    saveSessionOnTimeout: true,
    saveSessionOnQuit: true,
    deleteSessionOnTimeout: true,
    deleteSessionOnQuit: true,
    applyRecordLocking: true,
};

export const ValidCatiModeSettings: Partial<IQuestionnaireSettings> = {
    saveSessionOnTimeout: true,
    saveSessionOnQuit: true,
    applyRecordLocking: true,
};

export function GetStrictInterviewingSettings(questionnaireSettingsList: IQuestionnaireSettings[]): IQuestionnaireSettings {
    for (const questionnaireSettings of questionnaireSettingsList) {
        if (questionnaireSettings.type === "StrictInterviewing") {
            return questionnaireSettings;
        }
    }
    return {} as IQuestionnaireSettings;
}

export function ValidateSettings(questionnaireSettings: IQuestionnaireSettings, questionnaireMode: QuestionnaireMode): [boolean, Partial<IQuestionnaireSettings>] {
    if (questionnaireMode === QuestionnaireMode.Cati) {
        return ValidateCATIModeSettings(questionnaireSettings);
    }
    return ValidateMixedModeSettings(questionnaireSettings);
}

export function ValidateCATIModeSettings(questionnaireSettings: IQuestionnaireSettings): [boolean, Partial<IQuestionnaireSettings>] {
    return validateSettings(questionnaireSettings, ValidCatiModeSettings);
}

export function ValidateMixedModeSettings(questionnaireSettings: IQuestionnaireSettings): [boolean, Partial<IQuestionnaireSettings>] {
    return validateSettings(questionnaireSettings, ValidMixedModeSettings);
}

function validateSettings(questionnaireSettings: IQuestionnaireSettings, validationSettings: Partial<IQuestionnaireSettings>): [boolean, Partial<IQuestionnaireSettings>] {
    const invalidSettings: any = {};
    for (const [property, value] of Object.entries(validationSettings)) {
        if (questionnaireSettings[property as keyof IQuestionnaireSettings] != value) {
            invalidSettings[property] = value;
        }
    }
    return [Object.keys(invalidSettings).length === 0, invalidSettings];
}
