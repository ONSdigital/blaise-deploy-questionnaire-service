import { InstrumentSettings } from "blaise-api-node-client";
import { InstrumentMode } from "./instrument_mode";
import {
  GetStrictInterviewingSettings,
  ValidateCATIModeSettings,
  ValidateMixedModeSettings,
  ValidateSettings
} from "./instrument_settings";

describe("Function GetStrictInterviewingSettings()", () => {
  const instrumentSettingTestList: InstrumentSettings[] = [
    {
      type: "FreeInterviewing",
      saveSessionOnTimeout: false,
      saveSessionOnQuit: true,
      deleteSessionOnTimeout: false,
      deleteSessionOnQuit: false,
      sessionTimeout: 20,
      applyRecordLocking: true
    },
    {
      type: "StrictInterviewing",
      saveSessionOnTimeout: false,
      saveSessionOnQuit: true,
      deleteSessionOnTimeout: false,
      deleteSessionOnQuit: false,
      sessionTimeout: 15,
      applyRecordLocking: false
    }
  ];

  it("Should return the instrument settings for the StrictInterviewing type", async () => {
    const strictInterviewingSettings = GetStrictInterviewingSettings(instrumentSettingTestList);
    expect(strictInterviewingSettings).toEqual({
      type: "StrictInterviewing",
      saveSessionOnTimeout: false,
      saveSessionOnQuit: true,
      deleteSessionOnTimeout: false,
      deleteSessionOnQuit: false,
      sessionTimeout: 15,
      applyRecordLocking: false
    });
  });
});

describe("Function ValidateCATIModeSettings()", () => {
  describe("when the settings are valid", () => {
    const instrumentSettings = {
      type: "StrictInterviewing",
      saveSessionOnTimeout: true,
      saveSessionOnQuit: true,
      deleteSessionOnTimeout: false,
      deleteSessionOnQuit: false,
      sessionTimeout: 15,
      applyRecordLocking: true
    };

    it("returns true", () => {
      const [valid, invalidSettings] = ValidateCATIModeSettings(instrumentSettings);
      expect(valid).toBeTruthy();
      expect(invalidSettings).toEqual({});
    });
  });

  describe("when the settings are invalid", () => {
    const instrumentSettings = {
      type: "StrictInterviewing",
      saveSessionOnTimeout: false,
      saveSessionOnQuit: true,
      deleteSessionOnTimeout: false,
      deleteSessionOnQuit: false,
      sessionTimeout: 15,
      applyRecordLocking: false
    };

    it("returns true", () => {
      const [valid, invalidSettings] = ValidateCATIModeSettings(instrumentSettings);
      expect(valid).toBeFalsy();
      expect(invalidSettings.saveSessionOnTimeout).toBeTruthy();
      expect(invalidSettings.applyRecordLocking).toBeTruthy();
      expect(invalidSettings).toEqual({
        "applyRecordLocking": true, "saveSessionOnTimeout": true
      });
    });
  });
});


describe("Function ValidateMixedModeSettings()", () => {
  describe("when the settings are valid", () => {
    const instrumentSettings = {
      type: "StrictInterviewing",
      saveSessionOnTimeout: true,
      saveSessionOnQuit: true,
      deleteSessionOnTimeout: true,
      deleteSessionOnQuit: true,
      sessionTimeout: 15,
      applyRecordLocking: true
    };

    it("returns true", () => {
      const [valid, invalidSettings] = ValidateMixedModeSettings(instrumentSettings);
      expect(valid).toBeTruthy();
      expect(invalidSettings).toEqual({});
    });
  });

  describe("when the settings are invalid", () => {
    const instrumentSettings = {
      type: "StrictInterviewing",
      saveSessionOnTimeout: true,
      saveSessionOnQuit: true,
      deleteSessionOnTimeout: false,
      deleteSessionOnQuit: false,
      sessionTimeout: 15,
      applyRecordLocking: true
    };

    it("returns true", () => {
      const [valid, invalidSettings] = ValidateMixedModeSettings(instrumentSettings);
      expect(valid).toBeFalsy();
      expect(invalidSettings.deleteSessionOnTimeout).toBeTruthy();
      expect(invalidSettings.deleteSessionOnQuit).toBeTruthy();
      expect(invalidSettings).toEqual({
        "deleteSessionOnTimeout": true, "deleteSessionOnQuit": true
      });
    });
  });
});


describe("Function ValidateSettings()", () => {
  const instrumentSettings = {
    type: "StrictInterviewing",
    saveSessionOnTimeout: true,
    saveSessionOnQuit: true,
    deleteSessionOnTimeout: false,
    deleteSessionOnQuit: false,
    sessionTimeout: 15,
    applyRecordLocking: true
  };

  describe("when the mode is CATI", () => {
    it("uses cati validation rules and returns true", () => {
      const [valid, invalidSettings] = ValidateSettings(instrumentSettings, InstrumentMode.Cati);
      expect(valid).toBeTruthy();
      expect(invalidSettings).toEqual({});
    });
  });

  describe("when the mode is MIXED", () => {
    it("uses cawi validation rules and returns false", () => {
      const [valid, invalidSettings] = ValidateSettings(instrumentSettings, InstrumentMode.Mixed);
      expect(valid).toBeFalsy();
      expect(invalidSettings.deleteSessionOnTimeout).toBeTruthy();
      expect(invalidSettings.deleteSessionOnQuit).toBeTruthy();
      expect(invalidSettings).toEqual({
        "deleteSessionOnTimeout": true, "deleteSessionOnQuit": true
      });
    });
  });
});
