
import { InstrumentSettings } from "blaise-api-node-client";
import { InstrumentMode } from "./instrument_mode";

export const ValidMixedModeSettings: Partial<InstrumentSettings> = {
  saveSessionOnTimeout: true,
  saveSessionOnQuit: true,
  deleteSessionOnTimeout: true,
  deleteSessionOnQuit: true,
  applyRecordLocking: true,
};

export const ValidCatiModeSettings: Partial<InstrumentSettings> = {
  saveSessionOnTimeout: true,
  saveSessionOnQuit: true,
  applyRecordLocking: true,
};

export function GetStrictInterviewingSettings(instrumentSettingsList: InstrumentSettings[]): InstrumentSettings {
  for (const instrumentSettings of instrumentSettingsList) {
    if (instrumentSettings.type === "StrictInterviewing") {
      return instrumentSettings;
    }
  }
  return {} as InstrumentSettings;
}

export function ValidateSettings(instrumentSettings: InstrumentSettings, instrumentMode: InstrumentMode): [boolean, Partial<InstrumentSettings>] {
  if (instrumentMode === InstrumentMode.Cati) {
    return ValidateCATIModeSettings(instrumentSettings);
  }
  return ValidateMixedModeSettings(instrumentSettings);
}

export function ValidateCATIModeSettings(instrumentSettings: InstrumentSettings): [boolean, Partial<InstrumentSettings>] {
  return validateSettings(instrumentSettings, ValidCatiModeSettings);
}

export function ValidateMixedModeSettings(instrumentSettings: InstrumentSettings): [boolean, Partial<InstrumentSettings>] {
  return validateSettings(instrumentSettings, ValidMixedModeSettings);
}

function validateSettings(instrumentSettings: InstrumentSettings, validationSettings: Partial<InstrumentSettings>): [boolean, Partial<InstrumentSettings>] {
  const invalidSettings: any = {};
  for (const [property, value] of Object.entries(validationSettings)) {
    if (instrumentSettings[property as keyof InstrumentSettings] != value) {
      invalidSettings[property] = value;
    }
  }
  return [Object.keys(invalidSettings).length === 0, invalidSettings];
}
